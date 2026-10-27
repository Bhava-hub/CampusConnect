const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
