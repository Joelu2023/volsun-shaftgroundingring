import fs from "node:fs";
import path from "node:path";

export type InboxDocxCandidateResult =
  | { ok: true; basename: string; absolutePath: string }
  | { ok: false; reason: string };

export function resolveInboxDir(rootDir?: string): string {
  const root = rootDir ?? path.resolve(__dirname, "..");
  return path.join(root, "content", "inbox");
}

/** Normalize fs.watch filename (string | Buffer | null). */
export function normalizeWatchFilename(filename: string | Buffer | null | undefined): string | null {
  if (filename == null) return null;
  const raw = Buffer.isBuffer(filename) ? filename.toString("utf8") : filename;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Returns true when resolvedPath is a direct file child of inboxRoot (not nested, not traversal).
 */
export function isDirectInboxRootFile(inboxRoot: string, resolvedPath: string): boolean {
  const root = path.resolve(inboxRoot);
  const resolved = path.resolve(resolvedPath);
  return path.dirname(resolved) === root;
}

/**
 * Evaluate whether candidate refers to a processable DOCX in inbox root.
 * Uses path.resolve + dirname — not string prefix/includes checks alone.
 */
export function evaluateInboxDocxCandidate(
  inboxDir: string,
  candidate: string,
  options: { requireExistingFile?: boolean } = {},
): InboxDocxCandidateResult {
  const inboxRoot = path.resolve(inboxDir);
  const trimmed = candidate.trim();
  if (!trimmed) return { ok: false, reason: "empty_candidate" };

  const resolved = path.resolve(inboxRoot, trimmed);
  if (!isDirectInboxRootFile(inboxRoot, resolved)) {
    return { ok: false, reason: "not_inbox_root_child" };
  }

  const basename = path.basename(resolved);

  if (basename.startsWith("~$")) {
    return { ok: false, reason: "office_temp_file" };
  }

  if (!basename.toLowerCase().endsWith(".docx")) {
    return { ok: false, reason: "not_docx" };
  }

  if (options.requireExistingFile) {
    if (!fs.existsSync(resolved)) {
      return { ok: false, reason: "not_found" };
    }
    const stat = fs.statSync(resolved);
    if (!stat.isFile()) {
      return { ok: false, reason: "not_a_file" };
    }
  }

  return { ok: true, basename, absolutePath: resolved };
}

export function isInboxProcessableDocxCandidate(
  inboxDir: string,
  candidate: string,
  options?: { requireExistingFile?: boolean },
): boolean {
  return evaluateInboxDocxCandidate(inboxDir, candidate, options).ok;
}

/** List basenames of processable DOCX files in inbox root (excludes archive/** and subdirs). */
export function listInboxDocxFiles(inboxDir: string): string[] {
  const inboxRoot = path.resolve(inboxDir);
  if (!fs.existsSync(inboxRoot)) return [];

  return fs
    .readdirSync(inboxRoot, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isFile()) return false;
      return isInboxProcessableDocxCandidate(inboxRoot, entry.name, { requireExistingFile: true });
    })
    .map((entry) => entry.name)
    .sort();
}

export function resolveFirstInboxDocx(inboxDir: string): { basename: string; absolutePath: string } {
  const names = listInboxDocxFiles(inboxDir);
  if (!names.length) throw new Error("No .docx file found in content/inbox");

  const evaluated = evaluateInboxDocxCandidate(inboxDir, names[0], { requireExistingFile: true });
  if (!evaluated.ok) {
    throw new Error(`Inbox docx candidate rejected: ${names[0]} (${evaluated.reason})`);
  }

  return { basename: evaluated.basename, absolutePath: evaluated.absolutePath };
}
