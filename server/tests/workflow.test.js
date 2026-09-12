const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

// Mock bcryptjs to avoid hashing overhead and ensure compare works
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  genSalt: jest.fn().mockResolvedValue('salt')
}));

// Mock Mongoose models to avoid hitting live database
jest.mock('../src/models/User', () => {
  return {
    findOne: jest.fn().mockImplementation(({ email }) => {
      if (email === 'recruiter@agentichire.com') {
        return Promise.resolve({
          _id: '507f1f77bcf86cd799439011',
          name: 'Sarah Jenkins',
          email: 'recruiter@agentichire.com',
          password: '$2a$10$placeholdershashhere', // dummy hash
          role: 'recruiter',
          comparePassword: () => Promise.resolve(true)
        });
      }
      return Promise.resolve(null);
    }),
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: '507f1f77bcf86cd799439011', ...data })),
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        name: 'Sarah Jenkins',
        email: 'recruiter@agentichire.com',
        role: 'recruiter'
      })
    })
  };
});

jest.mock('../src/models/Job', () => {
  return {
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: '507f1f77bcf86cd799439012', ...data })),
    find: jest.fn().mockResolvedValue([{ _id: '507f1f77bcf86cd799439012', title: 'Frontend Developer' }]),
    findById: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439012',
      title: 'Frontend Developer',
      required_skills: ['React', 'JavaScript'],
      preferred_skills: ['CSS']
    })
  };
});

jest.mock('../src/models/Candidate', () => {
  return {
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: '507f1f77bcf86cd799439013', ...data })),
    find: jest.fn().mockResolvedValue([{ _id: '507f1f77bcf86cd799439013', name: 'John Doe', status: 'pending' }]),
    findById: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439013',
      name: 'John Doe',
      email: 'john.doe@example.com',
      status: 'pending',
      resume_url: '/uploads/john-react-resume.pdf',
      save: jest.fn().mockResolvedValue(true)
    })
  };
});

jest.mock('../src/models/Workflow', () => {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: '507f1f77bcf86cd799439014', ...data })),
    findById: jest.fn().mockResolvedValue({
      _id: '507f1f77bcf86cd799439014',
      candidate_id: '507f1f77bcf86cd799439013',
      job_id: '507f1f77bcf86cd799439012',
      current_state: 'human_approval',
      status: 'paused_approval',
      save: jest.fn().mockResolvedValue(true)
    })
  };
});

jest.mock('../src/models/WorkflowLog', () => {
  return {
    create: jest.fn().mockResolvedValue(true),
    find: jest.fn().mockResolvedValue([{ agent_name: 'resume_parser', status: 'success' }])
  };
});

// Mock Workflow Engine
jest.mock('../src/workflows/hiringWorkflow', () => {
  return {
    execute: jest.fn().mockResolvedValue({ status: 'running' }),
    resume: jest.fn().mockResolvedValue({ status: 'success' })
  };
});

describe('AgenticHire-AI Integration API Tests', () => {
  let token = '';

  beforeAll(() => {
    process.env.JWT_SECRET = 'your_jwt_secret_key_here';
  });

  // 1. Signup / Auth Test
  test('POST /api/auth/signup - should create recruiter user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Sarah Jenkins',
        email: 'newrecruiter@agentichire.com',
        password: 'Password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token; // Save token for future authenticated requests
  });

  // 2. Login Test
  test('POST /api/auth/login - should authenticate recruiter user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'recruiter@agentichire.com',
        password: 'Password123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  // 3. Job Specification Creation Test
  test('POST /api/jobs - should create job specification with JWT auth', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Frontend Developer',
        description: 'React developer position',
        min_experience: 2,
        required_skills: ['React', 'JavaScript'],
        preferred_skills: ['CSS']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Frontend Developer');
  });

  // 4. Start Workflow Test
  test('POST /api/workflow/start - should trigger candidate workflow', async () => {
    const res = await request(app)
      .post('/api/workflow/start')
      .send({
        candidateId: '507f1f77bcf86cd799439013',
        jobId: '507f1f77bcf86cd799439012'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('running');
  });

  // 5. Resume Human Approval Workflow Test
  test('POST /api/workflow/approve - should resume workflow via recruiter approval decision', async () => {
    const res = await request(app)
      .post('/api/workflow/approve')
      .set('Authorization', `Bearer ${token}`)
      .send({
        workflowId: '507f1f77bcf86cd799439014',
        decision: 'approve'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
