# Running AgenticHire-AI

Follow these steps to spin up the local development environment and run verification suites.

## Prerequisites
- **Node.js** (v20+ recommended)
- **Docker Desktop** (open and running on your system)

---

## Step 1: Start Databases (Docker)
Ensure Docker Desktop is running, then execute the following command at the root of the project to start MongoDB and Qdrant in the background:
```bash
docker compose up -d
```

---

## Step 2: Start Express Backend Server
Open a new terminal, navigate to `/server`, and launch the backend server:
```bash
cd server
npm install
npm run dev
```
*The server will run on `http://localhost:5000`.*

---

## Step 3: Start Vite/React Frontend Client
Open a new terminal, navigate to `/client`, and launch the development server:
```bash
cd client
npm install
npm run dev
```
*The client app will launch on `http://localhost:5173`.*

---

## Step 4: Verification & Testing

### 1. Web UI Walkthrough
1. Open your browser to the client URL (e.g. `http://localhost:5173`).
2. You will be redirected to the Login page.
3. Click "Sign up here" to create a recruiter account.
4. On submission, you will be redirected to the dynamic `/dashboard` to manage jobs, upload candidates, and track background agent workflows.

### 2. Run Jest Integration Tests
To run the Express REST API integration tests (verifying JWT auth, job creation, workflow triggers, and manual approvals):
```bash
cd server
npm run test
```

### 3. Run E2E Smoke Test
To execute a fully automated candidate upload, parse, evaluation, pause/resume, and email delivery smoke test:
```bash
cd server
node scripts/smokeTest.js
```
