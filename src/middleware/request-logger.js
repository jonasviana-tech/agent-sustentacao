'use strict';

/**
 * Structured JSON logger for every request.
 * Logs method, path, status code, and duration.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    console.log(JSON.stringify({
      level: res.statusCode >= 400 ? 'warn' : 'info',
      msg: 'http_request',
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      ts: new Date().toISOString(),
    }));
  });

  next();
}

module.exports = requestLogger;
