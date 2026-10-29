# CampusConnect — Deployment and Monitoring

## 1. Live Deployment

**Website:** https://campusconnect-demo.duckdns.org

CampusConnect is deployed on an AWS EC2 instance using Docker Compose. Caddy provides HTTPS using a Let's Encrypt TLS certificate and automatically manages certificate renewal.

## 2. Deployment Architecture

The application uses the following request flow:

1. A user opens the website over HTTPS on port 443.
2. Caddy terminates HTTPS and forwards requests to the frontend container.
3. Nginx serves the frontend and proxies `/api/` requests to the backend.
4. The Node.js backend communicates with MongoDB Atlas.

### Services

| Service | Purpose | Access |
|---|---|---|
| Caddy | HTTPS reverse proxy | Public ports 80 and 443 |
| Frontend | Nginx-served web application | Internal port 80 |
| Backend | Node.js API | Container port 5000 |
| Prometheus | Metrics collection and alert evaluation | EC2 localhost port 9090 |
| Grafana | Monitoring dashboards | EC2 localhost port 3000 |
| MongoDB Atlas | Application database | External managed database |

Prometheus and Grafana are bound to localhost on the EC2 host and should not be exposed directly to the public internet.

## 3. Monitoring Configuration

Prometheus scrapes backend metrics from `http://backend:5000/metrics` every 15 seconds.

The backend exposes:
- HTTP request counts by method, route, and status code.
- HTTP request duration measurements.
- Default Node.js process metrics.

The Grafana data source uses `http://prometheus:9090`.

### Dashboard Panels

The monitoring dashboard includes:
- HTTP request rate.
- Requests grouped by status code.
- 95th-percentile HTTP request latency.
- Backend process memory usage.

## 4. Alerting Rules

The Prometheus alert rules include:

| Alert | Purpose |
|---|---|
| `BackendDown` | Detects when the backend target is unavailable. |
| `HighHTTP5xxErrorRate` | Detects an elevated rate of HTTP 5xx responses. |
| `HighBackendMemory` | Detects high backend memory usage. |

The rules were validated using `promtool check rules`, and the Prometheus API reported the rules as healthy. Alert notification delivery has not been verified; configure an appropriate notification receiver if email or messaging alerts are required.

## 5. Accessing Grafana

Grafana is not publicly exposed. Access it through an SSH tunnel from your local computer.

In PowerShell, replace the key path if your EC2 private key is stored elsewhere:

```powershell
ssh -i "$HOME\Downloads\campusconnect-key.pem" -L 3000:localhost:3000 ec2-user@52.64.80.177
```

Keep the SSH session open, then visit:

`http://localhost:3000`

Sign in with the Grafana credentials configured for your deployment. Never commit passwords, private keys, or environment files to Git.

## 6. Health Checks

Run these commands on the EC2 instance from the project directory:

### Check running services

```bash
sudo docker compose ps
```

### Check backend health

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{"status":"ok","message":"CampusConnect API running"}
```

### Check Prometheus readiness

```bash
curl http://localhost:9090/-/ready
```

### Check Prometheus scrape targets

```bash
curl -s http://localhost:9090/api/v1/targets
```

Confirm that the backend target is reported as up.

## 7. Troubleshooting

**Website does not open**
- Check that the EC2 instance is running.
- Verify the security group allows inbound TCP ports 80 and 443.
- Check Caddy and frontend container logs.

```bash
sudo docker compose logs --tail=100 caddy
sudo docker compose logs --tail=100 frontend
```

**Backend API is unavailable**
- Check backend container status and logs.
- Verify the `/health` endpoint.
- Check MongoDB Atlas connectivity and backend environment configuration.

```bash
sudo docker compose logs --tail=100 backend
```

**Prometheus cannot scrape the backend**
- Confirm the backend container is running.
- Verify the Prometheus target configuration uses the correct Compose service name and port.
- Inspect the target health and Prometheus logs.

**Grafana cannot be accessed**
- Confirm the Grafana container is running.
- Check that the SSH tunnel is active.
- Verify that local port 3000 is not already in use.

## 8. Security Considerations

- Serve the public website through HTTPS.
- Keep SSH access restricted to trusted source IP addresses.
- Do not expose Prometheus or Grafana publicly.
- Restrict direct inbound access to backend port 5000 if the API is intended to be accessed only through the reverse proxy.
- Store secrets in environment configuration, not in source control.
- Use appropriate MongoDB Atlas network access rules and database credentials.

## 9. Future Improvements

- Configure alert notification delivery.
- Add deployment health checks and automated verification to CI/CD.
- Expand dashboards with additional application-level metrics.
- Add automated monitoring and deployment tests.