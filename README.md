# CampusConnect

A student collaboration platform where learners can explore topics, share peer explanations, and organize study activities.

## Live Deployment

**Website:** https://campusconnect-demo.duckdns.org

CampusConnect is deployed on AWS EC2 using Docker Compose.
Caddy provides HTTPS with an automatically managed TLS certificate.
The frontend is served by Nginx, which proxies API requests to the backend.

### Deployment and Monitoring

See [Deployment and Monitoring Guide](docs/monitoring.md) for
deployment architecture, health checks, Prometheus metrics, Grafana access,
and alerting configuration.

---

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Quick Start (Local Development)](#quick-start-local-development)
- [Docker Compose Setup](#docker-compose-setup)
- [Kubernetes Deployment](#kubernetes-deployment)
- [API Routes](#api-routes)
- [Running Tests](#running-tests)
- [Security Scanning](#security-scanning)
- [Documentation](#documentation)

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                         Browser                         │
└───────────────────────────┬─────────────────────────────┘
                            │ :80
┌───────────────────────────▼─────────────────────────────┐
│          Frontend (React + Vite + TailwindCSS)           │
│                    served by Nginx                      │
│      /api/* → proxy → campusconnect-backend:5000         │
└───────────────────────────┬─────────────────────────────┘
                            │ :5000
┌───────────────────────────▼─────────────────────────────┐
│             Backend (Node.js 20 + Express 4)             │
│ Routes: /api/auth, /api/topics, /api/explanations,       │
│         /api/activities                                   │
│ Health: GET /health → { status: "ok" }                   │
└───────────────────────────┬─────────────────────────────┘
                            │ MONGO_URI
┌───────────────────────────▼─────────────────────────────┐
│                    MongoDB Atlas                        │
│                 (external cloud database)                │
└─────────────────────────────────────────────────────────┘
```

| Layer | Technology | Port |
|---|---|---:|
| Frontend | React 19, TypeScript, Vite, TailwindCSS, Nginx Alpine | 80 |
| Backend | Node.js 20, Express 4, Mongoose 7 | 5000 |
| Database | MongoDB Atlas | — |

---

## Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | 20 | Required for local development |
| npm | 9+ | Bundled with Node.js |
| Docker | 24+ | Docker Desktop or Docker Engine |
| kubectl | 1.28+ | Kubernetes CLI |
| Minikube | 1.30+ | Local Kubernetes cluster |
| Trivy | 0.50+ | Optional; used for security scanning |
| MongoDB Atlas | — | A free cluster is sufficient |

---

## Project Structure

```text
CampusConnect/
├── client/                         # React frontend
│   ├── src/
│   ├── Dockerfile                  # Nginx multi-stage build
│   ├── nginx.conf                  # Nginx config with /api/ proxy
│   └── .dockerignore
├── server/                         # Express backend
│   ├── src/
│   │   ├── routes/                 # auth, topics, explanations, activities
│   │   ├── models/                 # Mongoose models
│   │   └── middleware/             # auth middleware
│   ├── server.js                   # Entry point
│   ├── Dockerfile
│   └── .dockerignore
├── k8s/                            # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.example.yaml         # Template; never put real secrets here
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   └── kustomization.yaml
├── .github/
│   └── workflows/
│       └── security-scan.yml       # Trivy scan workflow
├── docs/
│   ├── docker.md                   # Docker build & Compose guide
│   └── kubernetes.md               # Kubernetes deployment guide
├── reports/
│   └── security/
│       ├── trivy-fs-report.json
│       ├── trivy-image-backend-report.json
│       ├── trivy-image-frontend-report.json
│       └── security-summary.md
├── trivy.yaml                      # Trivy scanner configuration
├── docker-compose.yml
└── README.md
```

---

## Environment Variables

| Variable | Where used | Required | Description |
|---|---|---|---|
| `MONGO_URI` | Backend (secret) | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend (secret) | Yes | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | Backend (config) | Yes | Token expiry duration (default: `30d`) |
| `PORT` | Backend (config) | Yes | Server listen port (default: `5000`) |
| `NODE_ENV` | Backend (config) | Yes | `production` or `development` |
| `VITE_API_BASE_URL` | Frontend (build) | Optional | API base path (default: `/api`) |

> **Never commit real values** for `MONGO_URI` or `JWT_SECRET`. Use `.env.example` as a template and keep your `.env` files in `.gitignore`.

---

## Quick Start (Local Development)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd CampusConnect
```

### 2. Set up the backend

```bash
cd server
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
npm ci
npm run dev
```

The backend starts on `http://localhost:5000`.

### 3. Set up the frontend

Open a second terminal from the repository root, then run:

```bash
cd client
npm ci
npm run dev
```

The frontend development server starts on `http://localhost:5173`. The Vite dev server should proxy `/api/*` requests to `http://localhost:5000`.

---

## Docker Compose Setup

Docker Compose runs the frontend and backend in containers.

```bash
# 1. Copy and configure the environment file
cp server/.env.example server/.env
# Edit server/.env and set MONGO_URI and JWT_SECRET

# 2. Build and start the services
docker compose up --build
```

Open the frontend at `http://localhost:3000` and check the backend health endpoint at `http://localhost:5000/health`, assuming these ports match your `docker-compose.yml`.

To stop the services:

```bash
docker compose down
```

---

## Kubernetes Deployment

See [`docs/kubernetes.md`](docs/kubernetes.md) for the full deployment guide.

### Quick steps

Start Minikube:

```bash
minikube start
```

Build the images using the Docker daemon that Minikube can access. On Windows PowerShell:

```powershell
minikube -p minikube docker-env --shell powershell | Invoke-Expression
docker build -t campusconnect-backend:local ./server
docker build -t campusconnect-frontend:local ./client
```

On macOS/Linux, use the Minikube Docker environment command appropriate for your shell, or load locally built images with `minikube image load`.

Create the namespace before creating the Secret if it does not already exist:

```bash
kubectl apply -f k8s/namespace.yaml
```

Create the Secret using your own values. Do not commit real credentials or paste them into shared logs:

```bash
kubectl create secret generic campusconnect-secrets \
  --from-literal=MONGO_URI='mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>' \
  --from-literal=JWT_SECRET='<your-secret>' \
  -n campusconnect
```

Apply the manifests:

```bash
kubectl apply -k k8s/
kubectl get pods -n campusconnect -w
```

Access the frontend:

```bash
kubectl port-forward svc/campusconnect-frontend 8081:80 -n campusconnect
```

Then open `http://localhost:8081`. Keep the port-forward command running while using the application; stop it with `Ctrl+C` when finished.

> If the Secret already exists, update it rather than creating it again. Follow `docs/kubernetes.md` for the project's exact configuration and deployment steps.

---

## API Routes

All API routes are prefixed with `/api`, except the health endpoint.

| Method | Path | Description | Auth required |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Log in and receive a JWT | No |
| GET | `/api/topics` | List all topics | Yes |
| POST | `/api/topics` | Create a topic | Yes |
| GET | `/api/explanations` | List peer explanations | Yes |
| POST | `/api/explanations` | Submit an explanation | Yes |
| GET | `/api/activities` | List study activities | Yes |
| POST | `/api/activities` | Create a study activity | Yes |
| GET | `/health` | Health check (no auth) | No |

---

## Running Tests

Backend unit tests use Jest.

```bash
cd server
npm test
```

The project documentation expects 23 tests to pass across authentication, topics, and activities. Confirm the current test output when running the suite.

---

## Security Scanning

The project uses Trivy for security scanning. Configuration is in [`trivy.yaml`](trivy.yaml).

### Filesystem scan (dependencies, secrets, and misconfigurations)

```bash
# Show HIGH and CRITICAL findings
trivy fs --config trivy.yaml --severity HIGH,CRITICAL .

# Save a JSON report (all severities allowed by the configuration)
trivy fs --config trivy.yaml --format json --output reports/security/trivy-fs-report.json .
```

Ensure the `reports/security/` directory exists before writing reports.

### Container image scan

```bash
trivy image --scanners vuln --severity HIGH,CRITICAL campusconnect-backend:local
trivy image --scanners vuln --severity HIGH,CRITICAL campusconnect-frontend:local
```

These commands filter the displayed findings to HIGH and CRITICAL vulnerabilities. A clean result does not necessarily mean the images have no findings at lower severity or in other scanner categories.

### Automated scanning

The workflow at [`.github/workflows/security-scan.yml`](.github/workflows/security-scan.yml) is intended to run Trivy in GitHub Actions. Check the workflow file to confirm its trigger branches and events.

Scan reports are stored under `reports/security/`. See [`reports/security/security-summary.md`](reports/security/security-summary.md) for the recorded findings and remediation notes. Regenerate reports after changing the Dockerfiles or rebuilding images so they reflect the latest scans.

---

## Documentation

| Document | Description |
|---|---|
| [`docs/docker.md`](docs/docker.md) | Building images and using Docker Compose |
| [`docs/kubernetes.md`](docs/kubernetes.md) | Kubernetes deployment guide |
| [`reports/security/security-summary.md`](reports/security/security-summary.md) | Security scan findings and remediation notes |
| [`docs/monitoring.md`](docs/monitoring.md) | AWS deployment, HTTPS, Prometheus, Grafana, and alerting |
