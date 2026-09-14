import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
	appendReviewLog,
	attachReviewLog,
	startReviewLog,
} from "./startReviewLog";

const dir = mkdtempSync(join(tmpdir(), "review-log-"));

function readLog(): string {
	return readFileSync(join(dir, "review.log"), "utf8");
}

describe("startReviewLog", () => {
	it("should capture console output without swallowing it", () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		attachReviewLog(dir);
		startReviewLog();

		console.log("Review folder: %s", dir);
		console.error("[codex] codex CLI exited with code 1 after 0s");
		appendReviewLog("✖ codex (azure/gpt-5.6-sol) — failed in 0s (exit 1)");

		expect(log).toHaveBeenCalledWith("Review folder: %s", dir);
		expect(error).toHaveBeenCalled();
		const contents = readLog();
		expect(contents).toContain(`Review folder: ${dir}`);
		expect(contents).toContain("[codex] codex CLI exited with code 1 after 0s");
		expect(contents).toContain(
			"✖ codex (azure/gpt-5.6-sol) — failed in 0s (exit 1)",
		);
	});
});
