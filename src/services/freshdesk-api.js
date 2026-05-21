'use strict';

const axios = require('axios');
const config = require('../config');

/**
 * Adds a private note to a Freshdesk ticket using the Freshdesk REST API.
 *
 * @param {number} ticketId - The Freshdesk ticket ID
 * @param {string} body - Note content (supports HTML)
 * @returns {Promise<object>} Freshdesk API response data
 */
async function addPrivateNote(ticketId, body) {
  const cfg = config();
  const { domain, apiKey } = cfg.freshdesk;

  if (!domain || !apiKey) {
    console.warn('[freshdesk-api] FRESHDESK_DOMAIN or FRESHDESK_API_KEY not set — skipping note.');
    return null;
  }

  if (!ticketId) {
    console.warn('[freshdesk-api] No ticketId provided — skipping note.');
    return null;
  }

  const url = `https://${domain}/api/v2/tickets/${ticketId}/notes`;

  const auth = Buffer.from(`${apiKey}:X`).toString('base64');

  const resp = await axios.post(url, {
    body,
    private: true,
  }, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    timeout: 15_000,
  });

  return resp.data;
}

module.exports = { addPrivateNote };
