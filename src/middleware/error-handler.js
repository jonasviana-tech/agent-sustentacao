'use strict';

/**
 * Global Express error handler.
 * Normalizes all errors into { ok, error, details? } format.
 */
function errorHandler(err, _req, res, _next) {
  const status = typeof err.statusCode === 'number' && err.statusCode >= 400
    ? err.statusCode
    : 500;

  const payload = {
    ok: false,
    error: err.message || 'internal_error',
  };

  if (err.details) payload.details = err.details;

  console.error(JSON.stringify({
    level: 'error',
    msg: 'unhandled_error',
    error: err.message,
    stack: err.stack,
    status,
    ts: new Date().toISOString(),
  }));

  res.status(status).json(payload);
}

module.exports = errorHandler;
