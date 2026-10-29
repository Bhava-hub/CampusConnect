const express = require('express');
const cors = require('cors');
const { register, metricsMiddleware } = require('./metrics');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/explanations', require('./routes/explanations'));
app.use('/api/activities', require('./routes/activities'));

// Health checks (Root & Docker healthcheck)
app.get('/', (req, res) => {
  res.json({ message: 'CampusConnect API running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CampusConnect API running' });
});
app.get('/metrics', async (req, res, next) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    next(err);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
