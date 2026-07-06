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

const ROOT = path.resolve(__dirname, "..");
export const INBOX_DIR = path.join(ROOT, "content", "inbox");
const LOCK_FILE = path.join(__dirname, ".watcher.lock");
const DEBOUNCE_MS = 2000;

const processing = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingFile: string | null = null;

function isProcessableDocx(name: string): boolean {
  return name.toLowerCase().endsWith(".docx") && !name.startsWith("~$");
}

function listInboxDocx(): string[] {
  if (!fs.existsSync(INBOX_DIR)) return [];
  return fs
    .readdirSync(INBOX_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && isProcessableDocx(e.name))
    .map((e) => e.name)
    .sort();
}

async function processFile(fileName: string, opts: PipelineOptions): Promise<void> {
  const fullPath = path.join(INBOX_DIR, fileName);
  if (processing.has(fullPath) || !fs.existsSync(fullPath)) return;

  processing.add(fullPath);
  fs.writeFileSync(LOCK_FILE, `${fileName}\n${new Date().toISOString()}`, "utf8");

  try {
    await runPipeline(fullPath, opts);
  } catch (err) {
    console.error(`[watcher] failed: ${fileName}`, err instanceof Error ? err.message : err);
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
  fs.mkdirSync(path.join(INBOX_DIR, "images"), { recursive: true });

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
    if (!filename || !isProcessableDocx(filename)) return;
    if (event !== "rename" && event !== "change") return;
    console.log(`[watcher] detected: ${filename}`);
    scheduleProcess(filename, opts);
  });
}

/** One-shot auto publish for the first docx in inbox (no watch loop). */
export async function autoPublishInbox(opts: PipelineOptions = {}): Promise<void> {
  const docx = listInboxDocx();
  if (!docx.length) throw new Error("No .docx file in content/inbox");
  if (docx.length > 1) console.warn(`[auto] multiple docx found, using: ${docx[0]}`);
  await runPipeline(path.join(INBOX_DIR, docx[0]), opts);
}
