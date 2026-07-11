import { strict as assert } from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  evaluateInboxDocxCandidate,
  isInboxProcessableDocxCandidate,
  listInboxDocxFiles,
  normalizeWatchFilename,
  resolveFirstInboxDocx,
} from "./inbox-paths";

const INBOX = path.resolve(__dirname, "..", "content", "inbox");

function assertRejected(inboxDir: string, candidate: string, reason: string) {
  const result = evaluateInboxDocxCandidate(inboxDir, candidate);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, reason);
}

test("accepts inbox root DOCX (case insensitive extension)", () => {
  assert.ok(isInboxProcessableDocxCandidate(INBOX, "article.docx"));
  assert.ok(isInboxProcessableDocxCandidate(INBOX, "ARTICLE.DOCX"));
});

test("rejects office temp, nested, archive, traversal, pdf, and directories", () => {
  assertRejected(INBOX, "~$article.docx", "office_temp_file");
  assertRejected(INBOX, "archive/article.docx", "not_inbox_root_child");
  assertRejected(INBOX, "archive\\article.docx", "not_inbox_root_child");
  assertRejected(INBOX, "subdir/article.docx", "not_inbox_root_child");
  assertRejected(INBOX, "../article.docx", "not_inbox_root_child");
  assertRejected(INBOX, "article.pdf", "not_docx");
  assertRejected(INBOX, "archive", "not_docx");
});

test("rejects missing files when requireExistingFile is set", () => {
  const result = evaluateInboxDocxCandidate(INBOX, "definitely-not-present-article.docx", {
    requireExistingFile: true,
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, "not_found");
});

test("normalizeWatchFilename handles string, Buffer, and null", () => {
  assert.equal(normalizeWatchFilename(null), null);
  assert.equal(normalizeWatchFilename(undefined), null);
  assert.equal(normalizeWatchFilename(""), null);
  assert.equal(normalizeWatchFilename("  "), null);
  assert.equal(normalizeWatchFilename("article.docx"), "article.docx");
  assert.equal(normalizeWatchFilename(Buffer.from("article.docx", "utf8")), "article.docx");
});

test("listInboxDocxFiles discovers root DOCX only in temp inbox", () => {
  const tmpInbox = fs.mkdtempSync(path.join(os.tmpdir(), "cf-inbox-"));
  try {
    fs.writeFileSync(path.join(tmpInbox, "top.docx"), "fake");
    fs.mkdirSync(path.join(tmpInbox, "archive"), { recursive: true });
    fs.writeFileSync(path.join(tmpInbox, "archive", "archived.docx"), "fake");
    fs.mkdirSync(path.join(tmpInbox, "subdir"), { recursive: true });
    fs.writeFileSync(path.join(tmpInbox, "subdir", "nested.docx"), "fake");
    fs.writeFileSync(path.join(tmpInbox, "~$temp.docx"), "fake");

    assert.deepEqual(listInboxDocxFiles(tmpInbox), ["top.docx"]);
    const first = resolveFirstInboxDocx(tmpInbox);
    assert.equal(first.basename, "top.docx");
    assert.equal(first.absolutePath, path.join(tmpInbox, "top.docx"));
  } finally {
    fs.rmSync(tmpInbox, { recursive: true, force: true });
  }
});

test("watcher, cli auto/draft/status import shared inbox-paths module", () => {
  const watcherSrc = fs.readFileSync(path.join(__dirname, "watcher.ts"), "utf8");
  const cliSrc = fs.readFileSync(path.join(__dirname, "cli.ts"), "utf8");
  assert.match(watcherSrc, /from "\.\/inbox-paths"/);
  assert.match(cliSrc, /from "\.\/inbox-paths"/);
  assert.match(watcherSrc, /listInboxDocxFiles/);
  assert.match(watcherSrc, /normalizeWatchFilename/);
  assert.match(watcherSrc, /evaluateInboxDocxCandidate/);
  assert.match(cliSrc, /listInboxDocxFiles/);
  assert.match(cliSrc, /resolveFirstInboxDocx/);
});
