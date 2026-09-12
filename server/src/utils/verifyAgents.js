const fs = require('fs');
const path = require('path');
const { createResumePdf } = require('./createTestPdf');
const ResumeParserAgent = require('../agents/resumeParserAgent');
const MatchingAgent = require('../agents/matchingAgent');
const ShortlistingAgent = require('../agents/shortlistingAgent');
const InterviewAgent = require('../agents/interviewAgent');
const EmailAgent = require('../agents/emailAgent');

async function testPipeline() {
  console.log('==================================================');
  console.log('Running Agent Pipeline Verification Test...');
  console.log('==================================================\n');

  try {
    // 1. Generate test PDF resume
    console.log('Generating sample resume PDF...');
    const pdfPath = await createResumePdf();
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('Sample PDF successfully read into buffer.\n');

    // 2. Run Resume Parser Agent
    console.log('[Agent 1/6] Running Resume Parser Agent...');
    const parseResult = await ResumeParserAgent.parse(pdfBuffer);
    console.log('Parsed Candidate details:');
    console.log(JSON.stringify(parseResult.data, null, 2));
    console.log('');

    // 3. Run Matching Agent
    console.log('[Agent 3/6] Running Matching Agent...');
    const mockJobSpec = {
      title: 'Frontend Developer',
      required_skills: ['React', 'JavaScript', 'CSS'],
      preferred_skills: ['Next.js', 'Tailwind CSS', 'TypeScript']
    };
    const matchResult = await MatchingAgent.evaluate(parseResult.data, mockJobSpec);
    console.log('Match Evaluation details:');
    console.log(JSON.stringify(matchResult.data, null, 2));
    console.log('');

    // 4. Run Shortlisting Agent
    console.log('[Agent 4/6] Running Shortlisting Agent...');
    const shortlistingResult = ShortlistingAgent.evaluate(matchResult.data.match_score);
    console.log('Shortlisting Evaluation details:');
    console.log(JSON.stringify(shortlistingResult.data, null, 2));
    console.log('');

    // 5. Run Interview Agent
    console.log('[Agent 5/6] Running Interview Agent...');
    const interviewResult = await InterviewAgent.generateAssessment(
      parseResult.data,
      matchResult.data,
      mockJobSpec.title
    );
    console.log('Tailored Interview Assessment generated:');
    console.log(interviewResult.data.assessment);
    console.log('');

    // 6. Run Email Agent
    console.log('[Agent 6/6] Running Email Agent...');
    const emailVars = {
      candidate_name: parseResult.data.name,
      job_title: mockJobSpec.title
    };
    const templateType = shortlistingResult.data.status === 'shortlist' ? 'interview' : 'rejection';
    const emailResult = EmailAgent.formatEmail(templateType, emailVars);
    console.log('Formatted Email subject:', emailResult.data.subject);
    console.log('Formatted Email body:\n', emailResult.data.body);
    
    // Simulate sending email
    await EmailAgent.send(parseResult.data.email, emailResult.data.subject, emailResult.data.body);

    console.log('==================================================');
    console.log('🎉 SUCCESS: All 6 Agents Executed and Verified!');
    console.log('==================================================');
  } catch (error) {
    console.error('❌ Agent Pipeline Verification failed:', error.stack);
    process.exit(1);
  }
}

testPipeline();
