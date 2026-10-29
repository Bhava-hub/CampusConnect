\# CampusConnect — Deployment and Monitoring



\## 1. Deployment Architecture



CampusConnect is deployed on an AWS EC2 instance using Docker Compose.



The deployment contains four services:



\- \*\*Frontend:\*\* Web application served on port 5173.

\- \*\*Backend:\*\* Node.js API served on port 5000.

\- \*\*Prometheus:\*\* Collects and stores application metrics on port 9090.

\- \*\*Grafana:\*\* Visualizes metrics through dashboards on port 3000.



Prometheus and Grafana are bound to localhost on the EC2 instance. Grafana is accessed securely through an SSH tunnel.



\## 2. Monitoring Architecture



The backend exposes application metrics through the `/metrics` endpoint. Prometheus scrapes these metrics every 15 seconds.



Grafana uses Prometheus as its data source to visualize application performance.



Data flow:



CampusConnect Backend → Prometheus → Grafana Dashboard



\## 3. Metrics Monitored



The monitoring dashboard tracks:



\- HTTP request rate.

\- HTTP requests grouped by status code.

\- 95th percentile HTTP request duration.

\- Backend process memory usage.

\- Default Node.js process metrics, including CPU usage.



\## 4. Prometheus Configuration



Prometheus scrapes the backend using the Docker Compose service address:



`http://backend:5000/metrics`



The Grafana Prometheus data source URL is:



`http://prometheus:9090`



These internal service addresses work within the Docker Compose network.



\## 5. Accessing Grafana



Create an SSH tunnel from the local computer:



`ssh -i "$HOME\\Downloads\\campusconnect-key.pem" -L 3000:localhost:3000 ec2-user@52.64.80.177`



Keep the SSH session running and open:



`http://localhost:3000`



\## 6. Health Checks



Check the running containers:



`sudo docker compose ps`



Check backend health:



`curl http://localhost:5000/health`



Check Prometheus readiness:



`curl http://localhost:9090/-/ready`



Check whether Prometheus can scrape the backend:



`curl -s http://localhost:9090/api/v1/targets`



\## 7. Troubleshooting



\- If a container is unhealthy, inspect its logs using `sudo docker compose logs --tail=100 SERVICE\_NAME`.

\- If metrics are missing, check the backend `/metrics` endpoint and Prometheus targets.

\- If Grafana cannot connect to Prometheus, verify the data source URL and Docker Compose network.

\- If SSH times out, check the EC2 instance state, public IP, route table, and security group rules.

\- If the website is unreachable, verify container health and the relevant EC2 inbound rules.



\## 8. Security Considerations



\- Keep environment variables and API credentials out of source control.

\- Restrict SSH access to trusted IP addresses.

\- Keep Prometheus and Grafana ports private and access Grafana through an SSH tunnel.

\- Review application logs and metrics when investigating failures.



\## 9. Future Improvements



\- Configure Prometheus alerting rules.

\- Add alert notifications for backend failures and high error rates.

\- Add deployment health checks and automated verification to CI/CD.



