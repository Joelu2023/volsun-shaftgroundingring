import { strict as assert } from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { storeResourceFile } from "./storage";

test("storeResourceFile uses local provider when RC_STORAGE_PROVIDER=local", async () => {
  const previousProvider = process.env.RC_STORAGE_PROVIDER;
  process.env.RC_STORAGE_PROVIDER = "local";

  let storageKey: string | null = null;

  try {
    const file = new File([Buffer.from("%PDF-1.4\n%test\n")], "closure-check.pdf", {
      type: "application/pdf",
    });
    const stored = await storeResourceFile(file, "Step2 closure check");

    storageKey = stored.storageKey;
    assert.equal(stored.storageProvider, "local");
    assert.match(stored.storageKey, /^uploads\/resources\/\d{4}\/\d{2}\//);
  } finally {
    if (storageKey) {
      const diskPath = path.join(process.cwd(), "public", storageKey);
      await fs.rm(diskPath, { force: true });
    }
    if (previousProvider === undefined) {
      delete process.env.RC_STORAGE_PROVIDER;
    } else {
      process.env.RC_STORAGE_PROVIDER = previousProvider;
    }
  }
});

test("storeResourceFile throws explicitly when RC_STORAGE_PROVIDER=object", async () => {
  const previousProvider = process.env.RC_STORAGE_PROVIDER;
  process.env.RC_STORAGE_PROVIDER = "object";

  try {
    const file = new File([Buffer.from("%PDF-1.4\n%test\n")], "closure-check.pdf", {
      type: "application/pdf",
    });

    await assert.rejects(
      () => storeResourceFile(file, "Step2 closure check"),
      /Object storage provider is configured but will be implemented in Resource Center Phase 5 Step 3\./
    );
  } finally {
    if (previousProvider === undefined) {
      delete process.env.RC_STORAGE_PROVIDER;
    } else {
      process.env.RC_STORAGE_PROVIDER = previousProvider;
    }
  }
});

