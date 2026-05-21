'use strict';

function normalizeText(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function stripHtml(input) {
  if (input == null) return '';
  if (typeof input !== 'string') return String(input);
  return input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>(\r?\n)?/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const PT_STOP_WORDS = new Set([
  'para', 'pela', 'pelo', 'com', 'sem', 'que', 'uma', 'um',
  'de', 'da', 'do', 'das', 'dos', 'na', 'no', 'nas', 'nos',
  'em', 'por', 'e', 'a', 'o', 'as', 'os', 'ao', 'aos',
  'se', 'ja', 'nao', 'erro', 'problema', 'ticket', 'chamado',
  'esta', 'esse', 'essa', 'isso', 'aqui', 'como', 'mais',
  'muito', 'tambem', 'quando', 'sobre', 'entre', 'depois',
  'antes', 'ainda', 'mesmo', 'outro', 'outra', 'outros',
  'pode', 'deve', 'sido', 'sendo', 'sera', 'foram', 'desde',
]);

/**
 * Extracts the most relevant keywords from a ticket's subject + description.
 * Optionally merges extra domain-specific terms.
 */
function extractKeywords({ subject, descriptionText }, extraTerms = []) {
  const text = normalizeText(`${subject || ''} ${descriptionText || ''}`);
  const words = text.split(/[^a-z0-9]+/g).filter(Boolean);

  const counts = new Map();
  for (const w of words) {
    if (w.length < 4) continue;
    if (PT_STOP_WORDS.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }

  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);

  const extra = (extraTerms || []).map((x) => normalizeText(x)).filter(Boolean);
  const merged = [...top, ...extra];
  return Array.from(new Set(merged)).slice(0, 20);
}

module.exports = { normalizeText, stripHtml, extractKeywords };
