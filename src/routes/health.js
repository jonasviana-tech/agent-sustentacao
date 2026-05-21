'use strict';

const { Router } = require('express');
const pkg = require('../../package.json');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: pkg.name,
    version: pkg.version,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

module.exports = router;
