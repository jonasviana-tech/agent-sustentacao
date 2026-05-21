'use strict';

const config = require('../config');

/**
 * Validates X-Webhook-Secret header against WEBHOOK_SHARED_SECRET.
 * Used on the Freshdesk webhook endpoint.
 */
function verifyWebhookSecret(req, res, next) {
  const { webhookSecret } = config().auth;
  if (!webhookSecret) {
    return res.status(503).json({ ok: false, error: 'webhook_secret_not_configured' });
  }

  const provided = req.header('X-Webhook-Secret') || '';
  if (provided !== webhookSecret) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  return next();
}

/**
 * Validates X-API-Key header against API_KEY.
 * Used on the on-demand triagem endpoint.
 */
function verifyApiKey(req, res, next) {
  const { apiKey } = config().auth;
  if (!apiKey) {
    return res.status(503).json({ ok: false, error: 'api_key_not_configured' });
  }

  const provided = req.header('X-API-Key') || '';
  if (provided !== apiKey) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }

  return next();
}

module.exports = { verifyWebhookSecret, verifyApiKey };
