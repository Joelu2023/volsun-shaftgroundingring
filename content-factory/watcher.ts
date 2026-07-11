/**
 * watcher: monitors content/inbox for .docx drops and triggers the auto pipeline.
 *
 *   npm run factory:watch
 *
 * Debounces file writes (2s) so copy operations finish before processing.
 * Uses a processing lock to prevent duplicate runs on the same file.
 */
import fs from "node:fs";
import path from "node:path";
import { runPipeline } from "./pipeline";
import type { PipelineOptions } from "./types";
import {
  evaluateInboxDocxCandidate,
  listInboxDocxFiles,
  normalizeWatchFilename,
  resolveInboxDir,
} from "./inbox-paths";

export const INBOX_DIR = resolveInboxDir();
const LOCK_FILE = path.join(__dirname, ".watcher.lock");
const DEBOUNCE_MS = 2000;

const processing = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingFile: string | null = null;

function listInboxDocx(): string[] {
  return listInboxDocxFiles(INBOX_DIR);
}

async function processFile(fileName: string, opts: PipelineOptions): Promise<void> {
  const evaluated = evaluateInboxDocxCandidate(INBOX_DIR, fileName, { requireExistingFile: true });
  if (!evaluated.ok) return;

  const fullPath = evaluated.absolutePath;
  if (processing.has(fullPath)) return;

  processing.add(fullPath);
  fs.writeFileSync(LOCK_FILE, `${evaluated.basename}\n${new Date().toISOString()}`, "utf8");

  try {
    await runPipeline(fullPath, opts);
  } catch (err) {
    console.error(`[watcher] failed: ${evaluated.basename}`, err instanceof Error ? err.message : err);
  } finally {
    processing.delete(fullPath);
    if (fs.existsSync(LOCK_FILE)) fs.unlinkSync(LOCK_FILE);
  }
}

function scheduleProcess(fileName: string, opts: PipelineOptions): void {
  pendingFile = fileName;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const target = pendingFile;
    pendingFile = null;
    debounceTimer = null;
    if (target) void processFile(target, opts);
  }, DEBOUNCE_MS);
}

export type WatcherOptions = PipelineOptions & {
  /** Process any docx already in inbox on startup. */
  scanOnStart?: boolean;
};

export function startWatcher(opts: WatcherOptions = {}): void {
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  fs.mkdirSync(`${INBOX_DIR}/images`, { recursive: true });

  console.log("Auto Publish Watcher v2");
  console.log(`  watching: ${INBOX_DIR}`);
  console.log("  drop a .docx (+ images/) to auto publish");
  console.log("");

  if (opts.scanOnStart !== false) {
    const existing = listInboxDocx();
    if (existing.length) {
      console.log(`[watcher] found ${existing.length} existing docx, processing: ${existing[0]}`);
      scheduleProcess(existing[0], opts);
    }
  }

  fs.watch(INBOX_DIR, (event, filename) => {
    const normalized = normalizeWatchFilename(filename);
    if (!normalized) return;
    if (!evaluateInboxDocxCandidate(INBOX_DIR, normalized).ok) return;
    if (event !== "rename" && event !== "change") return;
    console.log(`[watcher] detected: ${normalized}`);
    scheduleProcess(normalized, opts);
  });
}

/** One-shot auto publish for the first docx in inbox (no watch loop). */
export async function autoPublishInbox(opts: PipelineOptions = {}): Promise<void> {
  const docx = listInboxDocx();
  if (!docx.length) throw new Error("No .docx file in content/inbox");
  if (docx.length > 1) console.warn(`[auto] multiple docx found, using: ${docx[0]}`);
  const evaluated = evaluateInboxDocxCandidate(INBOX_DIR, docx[0], { requireExistingFile: true });
  if (!evaluated.ok) throw new Error(`Inbox docx candidate rejected: ${docx[0]}`);
  await runPipeline(evaluated.absolutePath, opts);
}
