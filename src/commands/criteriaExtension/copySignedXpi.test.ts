import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copySignedXpi } from "./copySignedXpi";

describe("copySignedXpi", () => {
	let dir: string;

	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "copy-signed-xpi-"));
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("copies the versioned add-on to a fixed name", async () => {
		const source = join(dir, "assist_criteria-0.597.0.xpi");
		writeFileSync(source, "signed");

		const fixed = await copySignedXpi(source, dir);

		expect(fixed).toBe(join(dir, "criteria-extension.xpi"));
		expect(readFileSync(fixed, "utf8")).toBe("signed");
	});

	it("leaves the versioned add-on in place", async () => {
		const source = join(dir, "assist_criteria-0.597.0.xpi");
		writeFileSync(source, "signed");

		await copySignedXpi(source, dir);

		expect(existsSync(source)).toBe(true);
	});

	it("returns the path when the add-on already carries the fixed name", async () => {
		const source = join(dir, "criteria-extension.xpi");
		writeFileSync(source, "signed");

		expect(await copySignedXpi(source, dir)).toBe(source);
		expect(readFileSync(source, "utf8")).toBe("signed");
	});
});
