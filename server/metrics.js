const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const requests = new client.Counter({
  name: 'campusconnect_http_requests_total',
  help: 'Total HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const duration = new client.Histogram({
  name: 'campusconnect_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next();

  const endTimer = duration.startTimer();

  res.on('finish', () => {
    const route = req.route
      ? req.baseUrl + req.route.path
      : 'unmatched';

    requests.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });

    endTimer({ method: req.method, route });
  });

  next();
}

module.exports = { register, metricsMiddleware };