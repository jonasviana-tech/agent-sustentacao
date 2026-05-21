'use strict';

const { Router } = require('express');
const { verifyWebhookSecret, verifyApiKey } = require('../middleware/auth');
const { runTriagemPipeline } = require('../services/triagem-pipeline');

const router = Router();

/**
 * POST /webhook/freshdesk
 *
 * Receives the Freshdesk Automator webhook payload, runs the full
 * triage pipeline, and returns the structured result.
 * Auth: X-Webhook-Secret header.
 */
router.post('/webhook/freshdesk', verifyWebhookSecret, async (req, res, next) => {
  try {
    const result = await runTriagemPipeline(req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /v1/triagem
 *
 * On-demand triage endpoint. Accepts the same ticket structure
 * (or a simplified { subject, description, company } body).
 * Auth: X-API-Key header.
 *
 * Accepts either:
 *   - Freshdesk-style payload: { ticket: { subject, description_text, ... } }
 *   - Simplified payload:      { subject, description, company: { name }, requester: { email } }
 */
router.post('/v1/triagem', verifyApiKey, async (req, res, next) => {
  try {
    const body = req.body || {};

    let payload;
    if (body.ticket && typeof body.ticket === 'object') {
      payload = body;
    } else {
      payload = {
        ticket: {
          id: body.freshdeskTicketId,
          subject: body.subject,
          description_text: body.descriptionText ?? body.description,
          company: body.company,
          requester: body.requester,
          tags: body.tags,
        },
      };
    }

    const result = await runTriagemPipeline(payload);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
