# Campus Connect: Docker & Docker Compose Guide

This guide provides instructions and architectural details for building, configuring, running, and verifying **Campus Connect** using Docker and Docker Compose. Following these instructions ensures the entire multi-service application runs consistently on any computer (macOS, Linux, or Windows).

---

## 1. Architecture Overview

Campus Connect is split into two containerized services connected via an internal Docker bridge network, integrating with an external cloud-hosted **MongoDB Atlas** database cluster.

```mermaid
flowchart LR
    ClientBrowser["User Browser"] -->|"HTTP :5173"| FrontendContainer["Frontend Container (Nginx Alpine)"]
    ClientBrowser -.->|"HTTP :5000 (Optional Direct API)"| BackendContainer["Backend Container (Node.js 20 Alpine)"]

    subgraph DockerHost["Docker Compose Host (campusconnect-network)"]
        FrontendContainer -->|"Reverse Proxy /api/* :5000"| BackendContainer
    end

    BackendContainer -->|"Mongoose TLS/SRV (:27017)"| MongoAtlas[("MongoDB Atlas (Cloud Database)")]
```

### Services Summary

| Service | Technology | Role | Port Mapping | Health Check Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **`backend`** | Node.js 20 (Alpine) + Express + Mongoose | REST API & Auth | `${PORT:-5000}:5000` | `http://localhost:5000/health` |
| **`frontend`** | React + Vite + TailwindCSS (Nginx Alpine) | Static SPA & API Proxy | `${FRONTEND_PORT:-5173}:80` | `http://localhost/health` |
| **`database`** | MongoDB Atlas (External Cloud) | Document Store | Cloud / Port 27017 | Verified via Mongoose connection |

---

## 2. Prerequisites

Before running the containers, ensure you have the following installed on your host system:

1. **Docker Engine & Docker Compose**:
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows) or Docker Engine with Docker Compose v2 (`docker compose version` $\ge 2.20.0$).
2. **MongoDB Atlas Account & Cluster**:
   - An active MongoDB Atlas cluster URI (e.g. `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/campusconnect`).
   - Your public IP whitelisted in MongoDB Atlas Network Access.

---

## 3. Environment Variables & Configuration

Docker Compose automatically loads variables from a `.env` file located in the project root directory where `docker-compose.yml` resides (per the [official Docker Compose environment variables reference](https://docs.docker.com/compose/how-tos/environment-variables/)).

### Configuration Variables Reference

| Variable | Description | Default Value | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Host port mapped to backend API container | `5000` | Optional |
| `FRONTEND_PORT` | Host port mapped to frontend web interface | `5173` | Optional |
| `MONGO_URI` | MongoDB Atlas connection string with credentials | None | **Yes** |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens | None (set via secret) | **Yes** |
| `JWT_EXPIRE` | Expiration window for JWT authentication tokens | `30d` | Optional |
| `NODE_ENV` | Application environment mode | `production` | Optional |
| `VITE_API_BASE_URL` | Base URL used by frontend client build | `/api` | Optional |

---

## 4. Quick Start (Step-by-Step)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd CampusConnect-main
```

### Step 2: Configure Environment Variables

Copy the provided `.env.example` template to `.env`:

```bash
cp .env.example .env
```

Open `.env` in your text editor and verify/update your configuration:

```env
PORT=5000
FRONTEND_PORT=5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=30d
NODE_ENV=production
```

> [!IMPORTANT]
> **MongoDB Atlas IP Whitelist**:
> In MongoDB Atlas, containers share your host machine's public outbound IP. Ensure your IP is whitelisted:
> 1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
> 2. Navigate to **Security** $\rightarrow$ **Network Access**.
> 3. Click **Add IP Address**.
> 4. Select **Add Current IP Address** or **Allow Access from Anywhere (`0.0.0.0/0`)** for testing/development.
> 5. Click **Confirm**.

### Step 3: Build and Run Services with Docker Compose

Run the following command to build the Docker images and start both containers:

```bash
docker compose up --build
```

To run in the background (detached mode):

```bash
docker compose up -d --build
```

### Step 4: Verify Running Containers

Check service status and health check results:

```bash
docker compose ps
```

Expected output:
```text
NAME                     IMAGE                      COMMAND                  SERVICE    CREATED          STATUS                    PORTS
campusconnect-backend    campusconnect-backend      "docker-entrypoint.sâ€¦"   backend    10 seconds ago   Up 10 seconds (healthy)   0.0.0.0:5000->5000/tcp
campusconnect-frontend   campusconnect-frontend     "/docker-entrypoint.â€¦"   frontend   5 seconds ago    Up 5 seconds (healthy)    0.0.0.0:5173->80/tcp
```

### Step 5: Access the Application

- **Web Application**: Open [http://localhost:5173](http://localhost:5173) in your web browser.
- **Backend API**: Open [http://localhost:5000](http://localhost:5000) or query `http://localhost:5000/health`.

---

## 5. Verifying MongoDB Atlas Connection

Campus Connect includes multiple automated mechanisms to verify database connectivity.

### Method A: Automated Verification Script

Run the built-in diagnostic tool directly inside the running backend container:

```bash
docker compose exec backend node verify-db.js
```

**Expected output upon successful connection:**
```text
====================================================
 CampusConnect - MongoDB Atlas Verification Utility
====================================================

Target Connection URI: mongodb+srv://***:***@cluster0.zhx3fe8.mongodb.net/campusconnect?retryWrites=true&w=majority
Attempting connection to MongoDB Atlas (timeout: 10 seconds)...

[PASS] Successfully connected to MongoDB Atlas in 842ms!
Database Host : cluster0-shard-00-00.zhx3fe8.mongodb.net
Database Name : campusconnect
Connection Port: 27017
Ready State   : 1 (Connected)

[PASS] Ping to MongoDB Atlas server successful: { ok: 1 }
[INFO] Existing collections (4): users, topics, explanations, activities

[SUCCESS] MongoDB Atlas connectivity verified for Campus Connect.
```

### Method B: API Health Check Endpoint

Check the `/health` endpoint using `curl` or your browser:

```bash
curl http://localhost:5000/health
```

**JSON response when healthy:**
```json
{
  "status": "healthy",
  "message": "CampusConnect API running",
  "uptime": 142,
  "timestamp": "2026-10-27T08:30:00.000Z",
  "database": {
    "type": "MongoDB Atlas",
    "status": "connected",
    "readyState": 1,
    "host": "cluster0-shard-00-00.zhx3fe8.mongodb.net"
  }
}
```

If the database is disconnected or unreachable, the endpoint returns HTTP `503 Service Unavailable` with `"status": "degraded"`, and Docker Compose marks the container as `unhealthy`.

### Method C: Inspect Backend Container Logs

```bash
docker compose logs -f backend
```

Look for:
```text
MongoDB Connected: cluster0-shard-00-00.zhx3fe8.mongodb.net
Server running on port 5000
```

---

## 6. Dockerfile Specifications

### Backend Dockerfile (`server/Dockerfile`)
- **Base Image**: `node:20-alpine` (lightweight, minimal attack surface).
- **Security**: Runs as the non-root `node` user with isolated file permissions.
- **Layer Optimization**: Copies `package*.json` separately to cache `npm ci` layers.
- **Health Check**: Native Node.js HTTP ping to `/health` every 30 seconds (no external tools required).

### Frontend Dockerfile (`client/Dockerfile`)
- **Multi-Stage Build**:
  - *Stage 1 (Builder)*: Uses `node:20-alpine` to install dependencies and execute `npm run build` (Vite production compilation).
  - *Stage 2 (Production Web Server)*: Uses `nginx:1.27-alpine` (~25MB) to serve static assets and proxy `/api` calls.
- **Reverse Proxy**: Nginx forwards `/api/*` requests internally to `http://backend:5000/api/*`, eliminating browser CORS issues.
- **SPA Fallback**: Includes `try_files $uri $uri/ /index.html;` so page refreshes on React Router paths (e.g., `/topics`, `/activities`) function seamlessly.
- **Health Check**: Uses `wget` to query Nginx's dedicated `/health` endpoint.

---

## 7. Useful Docker Management Commands

| Action | Command |
| :--- | :--- |
| **Start services in background** | `docker compose up -d` |
| **Rebuild images and restart** | `docker compose up -d --build` |
| **View logs for all services** | `docker compose logs -f` |
| **View backend logs only** | `docker compose logs -f backend` |
| **View frontend logs only** | `docker compose logs -f frontend` |
| **Check container health status** | `docker compose ps` |
| **Execute MongoDB test script** | `docker compose exec backend node verify-db.js` |
| **Open an interactive shell in backend** | `docker compose exec backend sh` |
| **Stop all containers** | `docker compose stop` |
| **Stop and remove containers & networks** | `docker compose down` |
| **Remove containers, volumes, and orphans** | `docker compose down -v --remove-orphans` |

---

## 8. Troubleshooting Guide

### Issue 1: `MongoDB connection error: Could not connect to any servers in your MongoDB Atlas cluster`
- **Cause**: The host machine's IP address is not whitelisted in the MongoDB Atlas dashboard.
- **Solution**:
  1. Open [cloud.mongodb.com](https://cloud.mongodb.com/).
  2. Go to **Network Access** under **Security**.
  3. Click **Add IP Address** $\rightarrow$ select **Allow Access from Anywhere (`0.0.0.0/0`)** or enter your current IP.
  4. Wait ~60 seconds for Atlas to deploy the network rule, then restart the containers (`docker compose restart backend`).

### Issue 2: Port Conflict (`port is already allocated`)
- **Cause**: Port 5000 or 5173 is already in use by another local application (e.g., local Node server, AirPlay receiver on macOS).
- **Solution**:
  Change the host ports in your `.env` file without modifying application source code:
  ```env
  PORT=5005
  FRONTEND_PORT=3000
  ```
  Restart services: `docker compose up -d`. You can then access the app at `http://localhost:3000`.

### Issue 3: Frontend Container Waits for Backend to be Healthy
- **Cause**: In `docker-compose.yml`, the frontend service specifies `depends_on: { backend: { condition: service_healthy } }`. If the backend cannot connect to MongoDB Atlas, it reports degraded health and Docker delays the frontend startup.
- **Solution**: Inspect backend logs using `docker compose logs backend` to resolve the database connection. Once MongoDB connects, backend health becomes `healthy` and frontend starts automatically.
