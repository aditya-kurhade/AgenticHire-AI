const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const { initQdrantCollections } = require('../src/config/qdrant');
const app = require('../src/app');

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSmokeTest() {
  console.log('==================================================');
  console.log('🚀 Starting AgenticHire-AI E2E Smoke Test (Port 5001)...');
  console.log('==================================================\n');

  let serverInstance;
  let dbConn;

  try {
    // Connect to DB and Qdrant
    console.log('Connecting to databases...');
    dbConn = await connectDB();
    await initQdrantCollections();
    
    // Start temporary server instance
    console.log(`Starting temporary server on port ${PORT}...`);
    serverInstance = app.listen(PORT);

    // 1. Generate test PDF resume
    console.log('\nGenerating test PDF resume...');
    const { createResumePdf } = require('../src/utils/createTestPdf');
    const pdfPath = await createResumePdf();
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Failed to generate test resume at ${pdfPath}`);
    }
    console.log(`Generated PDF at: ${pdfPath}\n`);

    // 2. Recruiter Authentication
    const recruiterEmail = `recruiter.${Date.now()}@agentichire.com`;
    const password = 'Password123';
    
    console.log(`Registering recruiter user: ${recruiterEmail}...`);
    let registerRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Recruiter',
        email: recruiterEmail,
        password: password
      })
    });
    
    let registerData = await registerRes.json();
    if (!registerRes.ok) {
      throw new Error(`Signup failed: ${JSON.stringify(registerData)}`);
    }
    
    const token = registerData.data.token;
    console.log('Recruiter successfully registered and authenticated!\n');

    // 3. Create a Job Specification
    console.log('Creating job specification...');
    const jobRes = await fetch(`${BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Senior React Developer',
        description: 'Looking for a Senior React Developer with CSS skill.',
        min_experience: 3,
        required_skills: ['React', 'JavaScript'],
        preferred_skills: ['CSS']
      })
    });

    const jobData = await jobRes.json();
    if (!jobRes.ok) {
      throw new Error(`Job creation failed: ${JSON.stringify(jobData)}`);
    }

    const jobId = jobData.data._id;
    console.log(`Job Spec Created: "${jobData.data.title}" (ID: ${jobId})\n`);

    // 4. Upload Candidate Resume
    console.log('Uploading candidate resume and triggering workflow...');
    const fileBuffer = fs.readFileSync(pdfPath);
    const file = new File([fileBuffer], 'john-react-resume.pdf', { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('name', 'John Doe');
    formData.append('email', `john.doe.${Date.now()}@example.com`);
    formData.append('phone', '+1-555-0199');
    formData.append('jobId', jobId);

    const uploadRes = await fetch(`${BASE_URL}/api/candidates/upload`, {
      method: 'POST',
      body: formData
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(`Candidate upload/apply failed: ${JSON.stringify(uploadData)}`);
    }

    const candidateId = uploadData.data._id;
    const workflowId = uploadData.workflowId;
    console.log(`Candidate Registered: ${uploadData.data.name} (ID: ${candidateId})`);
    console.log(`Workflow Triggered (ID: ${workflowId})\n`);

    // 5. Poll Workflow State until it reaches human_approval (paused_approval)
    console.log('Polling workflow status, waiting for it to reach human_approval step...');
    let workflow = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const wfRes = await fetch(`${BASE_URL}/api/workflow/${workflowId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wfData = await wfRes.json();

      if (!wfRes.ok) {
        throw new Error(`Failed to fetch workflow state: ${JSON.stringify(wfData)}`);
      }

      workflow = wfData.data.workflow;
      console.log(`[Attempt ${attempts + 1}/${maxAttempts}] Current State: ${workflow.current_state} | Status: ${workflow.status}`);

      if (workflow.status === 'paused_approval') {
        break;
      }

      if (workflow.status === 'failed') {
        throw new Error(`Workflow execution failed at state: ${workflow.current_state}`);
      }

      attempts++;
      await sleep(1500);
    }

    if (workflow.status !== 'paused_approval') {
      throw new Error('Workflow did not reach paused_approval status in time.');
    }
    console.log('\n✅ Workflow successfully paused at human_approval node.\n');

    // 6. Perform Recruiter/Human Approval Decision
    console.log('Submitting Recruiter Approval decision: "approve"...');
    const approveRes = await fetch(`${BASE_URL}/api/workflow/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        workflowId: workflowId,
        decision: 'approve'
      })
    });

    const approveData = await approveRes.json();
    if (!approveRes.ok) {
      throw new Error(`Approval submission failed: ${JSON.stringify(approveData)}`);
    }
    console.log('Approval submitted successfully. Workflow resumed.\n');

    // 7. Poll Workflow State until completion (success)
    console.log('Polling workflow status, waiting for final execution to complete...');
    attempts = 0;
    while (attempts < maxAttempts) {
      const wfRes = await fetch(`${BASE_URL}/api/workflow/${workflowId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const wfData = await wfRes.json();

      if (!wfRes.ok) {
        throw new Error(`Failed to fetch workflow state: ${JSON.stringify(wfData)}`);
      }

      workflow = wfData.data.workflow;
      console.log(`[Attempt ${attempts + 1}/${maxAttempts}] Current State: ${workflow.current_state} | Status: ${workflow.status}`);

      if (workflow.status === 'success') {
        break;
      }

      if (workflow.status === 'failed') {
        throw new Error(`Workflow execution failed at state: ${workflow.current_state}`);
      }

      attempts++;
      await sleep(1500);
    }

    if (workflow.status !== 'success') {
      throw new Error('Workflow did not complete successfully.');
    }

    // 8. Final Verification
    console.log('\nPerforming final database verification...');
    const candidateRes = await fetch(`${BASE_URL}/api/candidates/${candidateId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const candidateData = await candidateRes.json();
    if (!candidateRes.ok) {
      throw new Error(`Failed to fetch final candidate state: ${JSON.stringify(candidateData)}`);
    }

    const candidate = candidateData.data;
    console.log(`Final Candidate Status: ${candidate.status} (Expected: shortlist)`);
    console.log(`Candidate Match Score: ${candidate.match_score}`);
    console.log(`Rubric assessment length: ${candidate.interview_rubric ? candidate.interview_rubric.length : 0} characters`);
    
    // Fetch logs to print
    const wfLogsRes = await fetch(`${BASE_URL}/api/workflow/${workflowId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const wfLogsData = await wfLogsRes.json();
    console.log('\n--- Execution Logs ---');
    wfLogsData.data.logs.forEach(log => {
      console.log(`Agent: ${log.agent_name} | Status: ${log.status} | Error: ${log.error || 'None'}`);
    });
    console.log('----------------------\n');
    
    if (candidate.status !== 'shortlist') {
      throw new Error(`Expected candidate status to be 'shortlist', got '${candidate.status}'`);
    }

    console.log('==================================================');
    console.log('🎉 SUCCESS: End-to-End Smoke Test Passed Perfectly!');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ Smoke Test Failed:', error.message);
    if (serverInstance) serverInstance.close();
    if (dbConn) await dbConn.disconnect();
    process.exit(1);
  }

  // Cleanup
  if (serverInstance) serverInstance.close();
  if (dbConn) await dbConn.disconnect();
  process.exit(0);
}

runSmokeTest();
