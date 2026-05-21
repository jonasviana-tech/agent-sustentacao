'use strict';

const fs = require('fs/promises');
const path = require('path');
const { normalizeText } = require('../utils/text');

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function scoreSnippet(snippetText, keywords) {
  const t = normalizeText(snippetText);
  let score = 0;
  for (const kw of keywords) {
    const k = normalizeText(kw);
    if (k && t.includes(k)) score += 1;
  }
  return score;
}

/**
 * Searches a single markdown file for lines matching any keyword,
 * then returns contextual snippets ranked by relevance.
 */
async function searchDocFile({ absPath, relativePath, keywords, contextLines = 10, maxSnippets = 5 }) {
  let raw;
  try {
    raw = await fs.readFile(absPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  const lines = raw.split(/\r?\n/);
  const normalizedKeywords = [...new Set(
    keywords.map((k) => String(k || '').trim()).filter(Boolean),
  )];

  if (!normalizedKeywords.length) return [];

  const seen = new Set();
  const hits = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNorm = normalizeText(lines[i]);
    const matched = normalizedKeywords.some((kw) => lineNorm.includes(normalizeText(kw)));
    if (!matched) continue;

    const startIdx = clamp(i - contextLines, 0, lines.length - 1);
    const endIdx = clamp(i + contextLines, 0, lines.length - 1);
    const key = `${startIdx}:${endIdx}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const text = lines.slice(startIdx, endIdx + 1).join('\n').trim();
    const score = scoreSnippet(text, normalizedKeywords);

    hits.push({
      file: relativePath,
      startLine: startIdx + 1,
      endLine: endIdx + 1,
      text,
      score,
    });
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, maxSnippets);
}

/**
 * Searches multiple documentation files and returns the globally best snippets.
 *
 * @param {object} args
 * @param {string} args.docsRoot - Absolute path to docs-agents-main root.
 * @param {string[]} args.relativePaths - Paths relative to docsRoot.
 * @param {string[]} args.keywords - Search terms from the ticket.
 * @param {number} [args.maxTotalSnippets=8]
 * @returns {Promise<Array<{file, startLine, endLine, text, score}>>}
 */
async function searchDocs({ docsRoot, relativePaths, keywords, maxTotalSnippets = 8 }) {
  const allSnippets = [];

  for (const relPath of relativePaths || []) {
    const absPath = path.resolve(docsRoot, relPath);
    const snippets = await searchDocFile({ absPath, relativePath: relPath, keywords });
    allSnippets.push(...snippets);
  }

  allSnippets.sort((a, b) => b.score - a.score);
  return allSnippets.slice(0, maxTotalSnippets);
}

module.exports = { searchDocs };
