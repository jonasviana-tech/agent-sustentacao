'use strict';

const express = require('express');
const config = require('./src/config');
const requestLogger = require('./src/middleware/request-logger');
const errorHandler = require('./src/middleware/error-handler');
const healthRoutes = require('./src/routes/health');
const triagemRoutes = require('./src/routes/triagem');

const cfg = config();
const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(requestLogger);

app.use(healthRoutes);
app.use(triagemRoutes);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'not_found' });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(cfg.port, () => {
    console.log(`[sustentacao-agent] listening on :${cfg.port}`);
  });
}

module.exports = app;
