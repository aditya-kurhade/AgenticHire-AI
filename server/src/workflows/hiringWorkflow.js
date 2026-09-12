const fs = require('fs');
const path = require('path');
const specLoader = require('../utils/specLoader');
const Workflow = require('../models/Workflow');
const WorkflowLog = require('../models/WorkflowLog');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// Import AI Agents
const ResumeParserAgent = require('../agents/resumeParserAgent');
const EmbeddingAgent = require('../agents/embeddingAgent');
const MatchingAgent = require('../agents/matchingAgent');
const ShortlistingAgent = require('../agents/shortlistingAgent');
const InterviewAgent = require('../agents/interviewAgent');
const EmailAgent = require('../agents/emailAgent');

class HiringWorkflowEngine {
  /**
   * Helper function to execute an agent function with retry logic.
   */
  static async runWithRetry(agentName, agentFn, input, workflowId) {
    const retryPolicy = specLoader.runRetryPolicy ? specLoader.runRetryPolicy() : specLoader.loadRetryPolicy();
    const maxRetries = retryPolicy.max_retries || 3;
    const retryDelay = retryPolicy.retry_delay_ms || 5000;

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        console.log(`[Workflow ${workflowId}] Executing node '${agentName}' (Attempt ${attempt + 1}/${maxRetries})...`);
        const output = await agentFn(input);
        
        // Log successful execution
        await WorkflowLog.create({
          workflow_id: workflowId,
          agent_name: agentName,
          input,
          output,
          status: 'success'
        });

        return output;
      } catch (error) {
        attempt++;
        console.error(`[Workflow ${workflowId}] Node '${agentName}' failed on attempt ${attempt}:`, error.message);
        
        if (attempt >= maxRetries) {
          // Log final failure
          await WorkflowLog.create({
            workflow_id: workflowId,
            agent_name: agentName,
            input,
            status: 'failed',
            error: error.message
          });
          throw error;
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Starts or resumes a workflow execution.
   */
  static async execute(workflowId) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found.');

    const candidate = await Candidate.findById(workflow.candidate_id);
    const job = await Job.findById(workflow.job_id);

    if (!candidate || !job) {
      throw new Error('Candidate or Job associated with workflow not found.');
    }

    const { workflow: nodeSequence } = specLoader.loadWorkflowSpec();
    let startIndex = nodeSequence.indexOf(workflow.current_state);
    if (startIndex === -1) startIndex = 0;

    workflow.status = 'running';
    await workflow.save();

    try {
      for (let i = startIndex; i < nodeSequence.length; i++) {
        const node = nodeSequence[i];
        workflow.current_state = node;
        await workflow.save();

        if (node === 'resume_parser') {
          // Load PDF buffer from disk
          const resumePath = path.resolve(__dirname, '..', '..', candidate.resume_url.replace(/^\//, ''));
          if (!fs.existsSync(resumePath)) {
            throw new Error(`Resume PDF file not found on disk at: ${resumePath}`);
          }
          const pdfBuffer = fs.readFileSync(resumePath);

          const result = await this.runWithRetry(
            'resume_parser',
            async () => await ResumeParserAgent.parse(pdfBuffer),
            { resumePath },
            workflow._id
          );

          // Update candidate parsed data
          candidate.parsed_resume_json = result.data;
          await candidate.save();
        }

        else if (node === 'embedding_agent') {
          const textToEmbed = JSON.stringify(candidate.parsed_resume_json || {});
          await this.runWithRetry(
            'embedding_agent',
            async () => {
              const pointId = Math.floor(Math.random() * 1000000);
              await EmbeddingAgent.storeChunk('resumes', pointId, textToEmbed, {
                candidateId: candidate._id.toString()
              });
              return { success: true, pointId };
            },
            { candidateId: candidate._id },
            workflow._id
          );
        }

        else if (node === 'matching_agent') {
          const result = await this.runWithRetry(
            'matching_agent',
            async () => await MatchingAgent.evaluate(candidate.parsed_resume_json, job),
            { candidateId: candidate._id, jobId: job._id },
            workflow._id
          );

          candidate.match_score = result.data.match_score;
          candidate.matched_skills = result.data.matched_required_skills;
          candidate.missing_skills = result.data.missing_skills;
          await candidate.save();
        }

        else if (node === 'shortlisting_agent') {
          const result = await this.runWithRetry(
            'shortlisting_agent',
            async () => ShortlistingAgent.evaluate(candidate.match_score),
            { matchScore: candidate.match_score },
            workflow._id
          );

          candidate.status = result.data.status;
          await candidate.save();
        }

        else if (node === 'human_approval') {
          // PAUSE WORKFLOW: interrupt execution to wait for recruiter approval
          console.log(`[Workflow ${workflow._id}] Paused at human_approval node.`);
          workflow.status = 'paused_approval';
          await workflow.save();
          return workflow;
        }

        else if (node === 'interview_agent') {
          // Requires candidate matches
          const matchResults = {
            missing_skills: candidate.missing_skills || []
          };
          const result = await this.runWithRetry(
            'interview_agent',
            async () => await InterviewAgent.generateAssessment(candidate.parsed_resume_json, matchResults, job.title),
            { candidateId: candidate._id },
            workflow._id
          );

          // Save interview assessment to candidate metadata or field
          candidate.interview_rubric = result.data.assessment;
          await candidate.save();
        }

        else if (node === 'email_agent') {
          const emailVars = {
            candidate_name: candidate.name,
            job_title: job.title
          };
          const templateType = candidate.status === 'shortlist' ? 'interview' : 'rejection';
          
          await this.runWithRetry(
            'email_agent',
            async () => {
              const formatted = EmailAgent.formatEmail(templateType, emailVars);
              await EmailAgent.send(candidate.email, formatted.data.subject, formatted.data.body);
              return { success: true, templateType };
            },
            { candidateEmail: candidate.email },
            workflow._id
          );
        }
      }

      // Mark workflow as completed successfully
      workflow.status = 'success';
      await workflow.save();
      console.log(`[Workflow ${workflow._id}] Completed successfully.`);
      return workflow;
    } catch (error) {
      console.error(`[Workflow ${workflow._id}] Execution failed:`, error.message);
      workflow.status = 'failed';
      await workflow.save();
      throw error;
    }
  }

  /**
   * Resumes the workflow after human approval decision.
   */
  static async resume(workflowId, decision) {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found.');
    if (workflow.status !== 'paused_approval') {
      throw new Error(`Cannot resume workflow in status '${workflow.status}'`);
    }

    const candidate = await Candidate.findById(workflow.candidate_id);
    if (!candidate) throw new Error('Candidate not found.');

    console.log(`[Workflow ${workflowId}] Resuming with decision: ${decision}`);
    
    // Log human approval action
    await WorkflowLog.create({
      workflow_id: workflow._id,
      agent_name: 'human_approval',
      input: { decision },
      output: { success: true },
      status: 'success'
    });

    if (decision === 'reject') {
      candidate.status = 'reject';
      await candidate.save();
      
      // If rejected, skip straight to email_agent to notify rejection
      workflow.current_state = 'email_agent';
      await workflow.save();
    } else {
      candidate.status = 'shortlist';
      await candidate.save();

      // Proceed to next node in sequence
      const { workflow: nodeSequence } = specLoader.loadWorkflowSpec();
      const currentIdx = nodeSequence.indexOf('human_approval');
      workflow.current_state = nodeSequence[currentIdx + 1] || 'email_agent';
      await workflow.save();
    }

    // Trigger execution loop
    return await this.execute(workflow._id);
  }
}

module.exports = HiringWorkflowEngine;
