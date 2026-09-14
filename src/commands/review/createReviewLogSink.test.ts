import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createReviewLogSink } from "./createReviewLogSink";

function tempDir(): string {
	return mkdtempSync(join(tmpdir(), "review-log-"));
}

function readLog(dir: string): string {
	return readFileSync(join(dir, "review.log"), "utf8");
}

describe("createReviewLogSink", () => {
	it("should buffer lines written before the review folder is known", () => {
		const sink = createReviewLogSink();
		const dir = tempDir();

		sink.append("Review folder: somewhere");
		sink.attach(dir);

		expect(readLog(dir)).toContain("Review folder: somewhere");
	});

	it("should head each run with the time and the invocation", () => {
		const sink = createReviewLogSink();
		const dir = tempDir();

		sink.append("first line");
		sink.attach(dir);

		const lines = readLog(dir).trim().split("\n");
		expect(lines[0]).toMatch(/^=== \d{4}-\d{2}-\d{2}T/);
		expect(lines[1]).toMatch(/^\$ /);
		expect(lines[2]).toBe("first line");
	});

	it("should append lines written after attaching", () => {
		const sink = createReviewLogSink();
		const dir = tempDir();

		sink.attach(dir);
		sink.append("✔ codex — done in 12s");

		expect(readLog(dir)).toContain("✔ codex — done in 12s");
	});

	it("should strip ANSI styling so the log stays readable", () => {
		const sink = createReviewLogSink();
		const dir = tempDir();
		const esc = String.fromCharCode(27);

		sink.attach(dir);
		sink.append(`${esc}[31mfailed${esc}[39m`);

		expect(readLog(dir)).toContain("\nfailed\n");
	});

	it("should keep earlier runs when the same review folder is reused", () => {
		const dir = tempDir();
		const first = createReviewLogSink();
		first.attach(dir);
		first.append("first run");

		const second = createReviewLogSink();
		second.attach(dir);
		second.append("second run");

		const log = readLog(dir);
		expect(log).toContain("first run");
		expect(log).toContain("second run");
	});
});
