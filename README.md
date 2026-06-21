# AgenticHire-AI: Spec-Driven Multi-Agent Recruitment Platform

This document outlines the step-by-step roadmap for building the AgenticHire-AI platform, from initial project setup to the final verification.

---

## Project Roadmap & Step-by-Step Guide

### Phase 1: Initial Repository & Directory Setup
1. **Initialize Project Directories**
   - Create the directory structure:
     - `/client` (React application)
     - `/server` (Express backend)
     - `/specs` (Hiring, workflow, and retry JSON configurations)
   - Initialize `/server` with `npm init -y` and install backend dependencies.
   - Initialize `/client` using Vite/React (`npm create vite@latest client -- --template react`) or similar, and configure Tailwind CSS and shadcn/ui.
2. **Setup Global Configuration & Environment Variables**
   - Create root `.env` / `/server/.env` and `/client/.env.local` files.
   - Set up Docker environment (MongoDB, Qdrant).

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

### Phase 5: Multi-Agent System & LangGraph Workflow
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

### Phase 6: Recruiter & Candidate Frontend (`/client`)
1. **Recruiter Portal**
   - Auth login/signup views.
   - Main dashboard, job creation, and candidate list.
   - Workflow visualization panel rendering states dynamically using React Flow.
2. **Candidate Portal**
   - Public apply routes `/jobs/:jobId/apply` bypassing authentication.
   - Drag-and-drop resume upload form.

---

### Phase 7: Testing & Verification
1. **Unit and Integration Testing**
   - Run tests using Jest/Supertest for API logic and agent outputs.
2. **E2E Scenario Testing**
   - Run full flow from creating job to parsing resume and sending emails.
