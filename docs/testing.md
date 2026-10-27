# CampusConnect Testing & Continuous Integration Guide

This document outlines the testing strategy, architecture, local test execution, and GitHub Actions CI configuration for CampusConnect.

---

## 1. Objectives & Overview

The goal of our test automation suite is to ensure that backend API endpoints function reliably and that any code changes or pull requests do not break existing features.

### Core Principles
- **No Dependency on Production Databases**: Tests run against an isolated test database (either an ephemeral in-memory MongoDB via `mongodb-memory-server` or a dedicated MongoDB Docker service container in CI). No personal credentials or live data are affected.
- **Fast and Predictable Feedback**: Tests execute in band with automatic database teardown between tests to prevent test pollution.
- **Automated CI Checks**: Every push and pull request triggers GitHub Actions to run the full test suite and report results directly on GitHub.

---

## 2. Test Architecture

### Architecture Separation (`server.js` vs `app.js`)
To enable integration testing with Supertest without port collisions or unwanted database connects during imports:
1. **[app.js](file:///server/app.js)**: Configures Express middlewares and API routes and exports the `app` instance without binding to a network port.
2. **[server.js](file:///server/server.js)**: Imports `app`, loads environment variables, calls `connectDB()`, and starts listening on the production/development port.
3. **Supertest**: Directly imports `app.js` and injects simulated HTTP requests in memory.

### Test Database Lifecycle (`tests/dbHandler.js`)
The database helper handles clean setup and teardown:
- `connect()`: Connects Mongoose to `process.env.MONGO_URI` (used by CI service containers) or automatically boots an in-memory Mongo instance (`mongodb-memory-server`) for local development.
- `clearDatabase()`: Clears all collections after every test to keep tests completely independent.
- `closeDatabase()`: Closes the Mongoose connection and terminates the in-memory server after all tests complete.

### Environment Setup (`tests/setupEnv.js`)
Configures test-safe dummy variables before tests execute:
- `NODE_ENV = 'test'`
- `JWT_SECRET = 'campusconnect_test_jwt_secret_key_12345'`
- `JWT_EXPIRE = '30d'`

---

## 3. Test Suites & Covered API Endpoints

### 1. Authentication Endpoints (`tests/auth.test.js`)
| Method | Endpoint | Scenario | Expected Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Valid new user registration | `201 Created` |
| `POST` | `/api/auth/register` | Missing required fields (name/email/password) | `400 Bad Request` |
| `POST` | `/api/auth/register` | Duplicate email registration | `400 Bad Request` |
| `POST` | `/api/auth/login` | Valid credentials | `200 OK` (with JWT token) |
| `POST` | `/api/auth/login` | Incorrect password | `401 Unauthorized` |
| `POST` | `/api/auth/login` | Non-existent user | `401 Unauthorized` |
| `POST` | `/api/auth/login` | Missing email or password | `400 Bad Request` |
| `GET` | `/api/auth/me` | Valid Bearer token | `200 OK` (returns user profile) |
| `GET` | `/api/auth/me` | Missing Authorization header | `401 Unauthorized` |
| `GET` | `/api/auth/me` | Invalid / malformed Bearer token | `401 Unauthorized` |

### 2. Topics / Questions Endpoints (`tests/topics.test.js`)
| Method | Endpoint | Scenario | Expected Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/topics` | Authenticated user creates a topic | `201 Created` |
| `POST` | `/api/topics` | Missing title or description | `400 Bad Request` |
| `POST` | `/api/topics` | Unauthenticated request (no token) | `401 Unauthorized` |
| `GET` | `/api/topics` | Retrieve all topics with explanation counts | `200 OK` |
| `GET` | `/api/topics/:id` | Retrieve topic with explanations | `200 OK` |
| `GET` | `/api/topics/:id` | Request non-existent topic ID | `404 Not Found` |
| `DELETE` | `/api/topics/:id` | Creator deletes their own topic | `200 OK` |
| `DELETE` | `/api/topics/:id` | Unauthorized user tries to delete topic | `403 Forbidden` |

### 3. Activities & System Health (`tests/activities.test.js`)
| Method | Endpoint | Scenario | Expected Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API root status check | `200 OK` |
| `GET` | `/health` | Docker container health check | `200 OK` |
| `POST` | `/api/activities` | Authenticated user creates activity | `201 Created` |
| `POST` | `/api/activities` | Missing required activity fields | `400 Bad Request` |
| `GET` | `/api/activities` | Retrieve list of activities | `200 OK` |

---

## 4. Running Tests Locally

Navigate to the `server/` directory:
```bash
cd server
```

### Run All Tests
```bash
npm test
```

### Run Tests in CI Mode (with code coverage)
```bash
npm run test:ci
```

### Run a Specific Test File
```bash
npx jest tests/auth.test.js
```

---

## 5. GitHub Actions CI Workflow

The workflow file is located at [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml).

### Workflow Triggers
- **Push**: Runs on pushes to `main`, `develop`, and `feature/**` branches.
- **Pull Request**: Runs whenever a pull request is opened or updated targeting `main` or `develop`.

### CI Pipeline Steps
1. **Spin up MongoDB Service Container**: A dedicated `mongo:6.0` container starts with health checks on port 27017.
2. **Checkout Repository**: Pulls the source code using `actions/checkout@v4`.
3. **Setup Node.js**: Configures Node.js 20 with automated npm package caching.
4. **Install Dependencies**: Runs `npm ci` for fast, clean, reproducible installs.
5. **Run Test Suite**: Executes `npm run test:ci` against the test container with coverage reporting.
6. **Upload Test Coverage**: Artifacts are automatically preserved using `actions/upload-artifact@v4`.

### Error Reporting & Failure Handling
- If any test assertion fails, Jest exits with code `1`, causing the CI step to fail immediately and marking the pull request with a red ❌.
- In PR code reviews, `jest-github-actions-reporter` adds inline annotations directly on the exact lines that caused the failure.

---

## 6. Verification of Acceptance Criteria

1. **Pull Request Trigger**:
   - Create a feature branch: `git checkout -b feature/test-ci`
   - Make a commit and push: `git push origin feature/test-ci`
   - Open a pull request against `main`.
   - GitHub Actions will automatically start the `Run Jest Backend Tests` job.

2. **Failing Test Failure Verification**:
   - Introduce an intentional failure (e.g. change an expected status code from `200` to `500` in a test).
   - Push the change.
   - GitHub Actions will fail the check, report the failure with clear stack traces, and block merging.

3. **Passing Test Verification**:
   - Revert the failure.
   - GitHub Actions will turn green ✅, allowing the PR to be merged safely.
