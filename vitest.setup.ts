import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll } from "vitest";

const storeDir = mkdtempSync(join(tmpdir(), "assist-test-store-"));
process.env.ASSIST_STORE_DIR = storeDir;

afterAll(() => {
	rmSync(storeDir, { recursive: true, force: true });
});
