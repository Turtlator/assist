import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readTranscriptTail } from "./readTranscriptTail";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "transcript-tail-"));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

describe("readTranscriptTail", () => {
	it("returns the whole file when it is smaller than the limit", () => {
		const filePath = join(dir, "s.jsonl");
		writeFileSync(filePath, "first\nsecond\n");

		expect(readTranscriptTail(filePath)).toBe("first\nsecond\n");
	});

	it("returns only the trailing bytes when the file exceeds the limit", () => {
		const filePath = join(dir, "s.jsonl");
		writeFileSync(filePath, `${"x".repeat(100)}\nlast\n`);

		expect(readTranscriptTail(filePath, 5)).toBe("last\n");
	});

	it("returns undefined when the file does not exist", () => {
		expect(readTranscriptTail(join(dir, "missing.jsonl"))).toBeUndefined();
	});
});
