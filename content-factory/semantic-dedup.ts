/**
 * semantic-dedup: keyword TF-IDF cosine similarity against existing articles.
 * Blocks publish when similarity > threshold (default 0.85).
 * Zero external API — suitable for CI / offline governance.
 */
import { articles } from "../src/data/mock/articles";
import type { ArticleRecord } from "./types";
import { articleBodyFingerprint } from "./quality-check";

export const DEFAULT_SIMILARITY_THRESHOLD = 0.85;

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "at", "in", "on", "for", "with", "by", "from", "is", "are", "was", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "that", "this", "these", "those", "it", "its", "as", "but", "if", "not", "no", "can", "volsun", "your", "our",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function cosineSimilarity(a: string, b: string): number {
  const tokensA = tokenize(a);
  const tokensB = tokenize(b);
  if (!tokensA.length || !tokensB.length) return 0;

  const tfA = termFreq(tokensA);
  const tfB = termFreq(tokensB);
  const vocab = new Set([...tfA.keys(), ...tfB.keys()]);

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const term of vocab) {
    const va = tfA.get(term) ?? 0;
    const vb = tfB.get(term) ?? 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export type SemanticDedupResult = {
  passed: boolean;
  maxSimilarity: number;
  matchedSlug: string | null;
  matchedTitle: string | null;
  threshold: number;
};

export function runSemanticDedup(
  record: ArticleRecord,
  threshold = DEFAULT_SIMILARITY_THRESHOLD,
): SemanticDedupResult {
  const candidate = articleBodyFingerprint(record);
  let maxSimilarity = 0;
  let matchedSlug: string | null = null;
  let matchedTitle: string | null = null;

  for (const existing of articles) {
    if (existing.slug === record.slug) continue;
    const fingerprint = articleBodyFingerprint(existing);
    const sim = cosineSimilarity(candidate, fingerprint);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      matchedSlug = existing.slug;
      matchedTitle = existing.locales.en.title;
    }
  }

  return {
    passed: maxSimilarity <= threshold,
    maxSimilarity,
    matchedSlug,
    matchedTitle,
    threshold,
  };
}
