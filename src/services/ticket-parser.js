'use strict';

const { stripHtml } = require('../utils/text');

function pickFirst(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function asNumber(value) {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Extracts the ticket object from any of the Freshdesk Automator payload
 * variants: nested { ticket: {...} }, legacy { freshdesk_webhook: {...} },
 * or flat top-level fields.
 */
function pickTicketRoot(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.ticket && typeof payload.ticket === 'object') return payload.ticket;
  if (payload.freshdesk_webhook && typeof payload.freshdesk_webhook === 'object') {
    return payload.freshdesk_webhook;
  }
  return payload;
}

function pickRequester(payload, root) {
  const c = root.requester || payload.requester || {};
  return {
    email: pickFirst(c.email, root.requester_email, payload.requester_email, root.email),
    name: pickFirst(c.name, root.requester_name, payload.requester_name),
    id: asNumber(pickFirst(c.id, root.requester_id, payload.requester_id)),
  };
}

function pickCompany(payload, root) {
  const c = root.company || payload.company || {};
  return {
    id: asNumber(pickFirst(c.id, root.company_id, payload.company_id)),
    name: pickFirst(c.name, root.company_name, payload.company_name),
  };
}

function pickTags(root, payload) {
  const raw = pickFirst(root.tags, payload.tags);
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.trim()) return raw.split(/[,;]\s*/).filter(Boolean);
  return [];
}

/**
 * Normalizes a raw Freshdesk payload into a predictable ticket object.
 *
 * @param {object} payload - Raw payload from Freshdesk webhook or API body.
 * @returns {{ id, subject, descriptionText, requester, company, tags, url }}
 */
function parseTicket(payload) {
  const root = pickTicketRoot(payload);
  const requester = pickRequester(payload, root);
  const company = pickCompany(payload, root);
  const tags = pickTags(root, payload);

  const subject = String(pickFirst(root.subject, payload.subject, '') || '').trim();

  const descriptionHtml = pickFirst(
    root.description, payload.description,
    root.description_html, payload.description_html,
  );
  const descriptionText = String(
    pickFirst(root.description_text, payload.description_text, stripHtml(descriptionHtml)) || '',
  ).trim();

  const id = asNumber(pickFirst(root.id, root.ticket_id, payload.id, payload.ticket_id));

  const freshdeskDomain = process.env.FRESHDESK_DOMAIN || '';
  const url = pickFirst(
    root.ticket_url, payload.ticket_url,
    id && freshdeskDomain ? `https://${freshdeskDomain}/a/tickets/${id}` : undefined,
  );

  return { id, subject, descriptionText, requester, company, tags, url };
}

module.exports = { parseTicket };
