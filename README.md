# AgenticHire-AI: Spec-Driven Multi-Agent Recruitment Platform

This document outlines the step-by-step roadmap for building the AgenticHire-AI platform, from initial project setup to the final verification.

---

## Project Roadmap & Step-by-Step Guide

### Phase 1: Initial Setup
1. **Initialize Project & Databases**
   - Create the directory structure: `/client` (React application), `/server` (Express backend), `/specs`.
   - Set up Docker environment (MongoDB, Qdrant).
   - Configure global and local environment variables (root `.env`, `/server/.env`, `/client/.env.local`).

---

### Phase 2: Specification Base Setup
1. **Create Configuration Files**
   - Save `/specs/hiring/frontend-developer.json` containing roles, skills, and minimum scores.
   - Save `/specs/workflow/default-hiring-workflow.json` defining the execution sequence of AI agents.
   - Save `/specs/system/retry-policy.json` for managing LLM and database failures.

---

### Phase 3: Database & Models (MongoDB & Qdrant)
1. **MongoDB Connection & Mongoose Schemas**
   - Implement schemas under `/server/src/models/`:
     - `User` (recruiter authorization)
     - `Job` (job specs and requirements)
     - `Candidate` (status, contact, parsed data)
     - `Workflow` (agent execution checkpoints)
     - `WorkflowLog` (detailed logs of agent steps)
2. **Qdrant Vector Database Connection**
   - Configure connection helper to Qdrant service on port `6333`.
   - Setup collections for resumes and hiring policies.

---

### Phase 4: Express API & Authenticated Core
1. **Authentication Endpoint**
   - Create signup, login, and authorization check routes under `/server/src/routes/auth.js`.
2. **Job Management Endpoint**
   - Create jobs creation/retrieval routes under `/server/src/routes/jobs.js`.
3. **Candidate & Resume Submission Endpoint**
   - Implement file upload routing under `/server/src/routes/candidates.js` storing resumes in `/server/uploads`.

---

### Phase 5: Recruiter Auth & Dashboard Frontend
1. **Routing & Auth Store Configuration**
   - Configure client-side routing using `react-router-dom`.
   - Build client authentication store managing tokens using `zustand`.
2. **Authentication Pages**
   - Implement recruiter login/signup forms with validation and backend api integration.
   - Implement Route protection guards to restrict unauthorized access to dashboards.
3. **Dashboard Shell**
   - Implement recruiter dashboard shell layout containing side navigation navigation.

---

### Phase 6: Multi-Agent System & LangGraph Workflow
1. **Build AI Agents (`/server/src/agents/`)**
   - **Resume Parser Agent**: Extracts experience/skills from PDF.
   - **Embedding Agent**: Embeds data and stores/retrieves context from Qdrant.
   - **Matching Agent**: Evaluates resume against specification using RAG.
   - **Shortlisting Agent**: Recommends candidate status based on specs.
   - **Interview Agent**: Formulates test rubrics and coding questions.
   - **Email Agent**: Automates template notification delivery via Resend.
2. **LangGraph Orchestrator (`/server/src/workflows/`)**
   - Construct state graph utilizing defined AI agents.
   - Add state persistence and resume checkpoints for human approval steps.
   - Incorporate the dynamic retry policies.

---

### Phase 7: Recruiter & Candidate Frontend Features
1. **Recruiter Features**
   - Job creation and detailed specification manager.
   - Candidate applicant listing, details view, and AI decision approval/rejection tools.
   - Workflow visualization panel rendering states dynamically using React Flow.
2. **Candidate Portal**
   - Public apply routes `/jobs/:jobId/apply` bypassing authentication.
   - Drag-and-drop resume upload form.

---

### Phase 8: Testing & Verification
1. **Unit and Integration Testing**
   - Run tests using Jest/Supertest for API logic and agent outputs.
2. **E2E Scenario Testing**
   - Run full flow from creating job to parsing resume and sending emails.


Remaining important work:
React Flow workflow visualization
Spec requires React Flow, but reactflow / @xyflow/react is not installed or used.
Current dashboard shows workflow/log UI, but not a real React Flow graph.

LangGraph orchestration
Workflow engine exists in server/src/workflows/hiringWorkflow.js.
But it is custom JavaScript orchestration, not actual LangGraph.

Real embeddings
EmbeddingAgent uses deterministic hash vectors.
Spec says BAAI/bge-small-en-v1.5; that is not actually integrated yet.

Full RAG ingestion
Qdrant search exists.
But there is no proper document chunking/indexing pipeline for policies, evaluation docs, interview guidelines, etc.

Real Resend package/client
Email sends via raw fetch and falls back to mock.
Good enough for dev, but not a complete Resend integration.

Workflow logs to /server/logs
Logs are persisted in MongoDB.
Spec also says workflow logs must be stored inside /server/logs; that file logging is not implemented.

Better recruiter dashboard pages
Routes now exist, but dashboard is still one large tabbed component.
Could be split into real page components for jobs, candidates, workflows, analytics.

More tests
Existing server tests pass.
Still missing deeper tests for RAG retrieval, retry failures, agent outputs, and full E2E.

So: core flow is there, but the biggest remaining coding features are React Flow visualization, real LangGraph, real embedding/RAG ingestion, and file-based workflow failure logs.