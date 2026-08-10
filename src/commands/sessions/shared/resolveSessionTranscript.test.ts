import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveSessionTranscript } from "./resolveSessionTranscript";

const SESSION_ID = "991a1fde-669f-43f0-9b30-60892465b411";

let projectsRoot: string;

function writeTranscript(
	projectDir: string,
	sessionId: string,
	lines: unknown[],
): string {
	const dir = join(projectsRoot, projectDir);
	mkdirSync(dir, { recursive: true });
	const filePath = join(dir, `${sessionId}.jsonl`);
	writeFileSync(
		filePath,
		`${lines.map((l) => JSON.stringify(l)).join("\n")}\n`,
	);
	return filePath;
}

function userLine(text: string, timestamp: string) {
	return {
		type: "user",
		sessionId: SESSION_ID,
		cwd: "/home/dev/other-repo",
		timestamp,
		message: { content: text },
	};
}

function assistantLine(timestamp: string) {
	return {
		type: "assistant",
		sessionId: SESSION_ID,
		timestamp,
		message: { content: [{ type: "text", text: "done" }] },
	};
}

describe("resolveSessionTranscript", () => {
	beforeEach(() => {
		projectsRoot = mkdtempSync(join(tmpdir(), "session-transcript-"));
	});

	afterEach(() => {
		rmSync(projectsRoot, { recursive: true, force: true });
	});

	it("resolves a transcript under a project directory for another repo", () => {
		mkdirSync(join(projectsRoot, "-home-dev-assist"), { recursive: true });
		const filePath = writeTranscript("-home-dev-other-repo", SESSION_ID, [
			userLine("Fix the flaky test", "2026-08-10T01:00:00.000Z"),
			assistantLine("2026-08-10T01:05:00.000Z"),
		]);

		const resolved = resolveSessionTranscript(SESSION_ID, projectsRoot);

		expect(resolved?.path).toBe(filePath);
		expect(resolved?.prompt).toBe("Fix the flaky test");
		expect(resolved?.firstTimestamp).toBe("2026-08-10T01:00:00.000Z");
		expect(resolved?.lastTimestamp).toBe("2026-08-10T01:05:00.000Z");
	});

	it("returns undefined when no transcript exists for the session", () => {
		writeTranscript("-home-dev-assist", "another-session", [
			userLine("Something else", "2026-08-10T01:00:00.000Z"),
		]);

		expect(resolveSessionTranscript(SESSION_ID, projectsRoot)).toBeUndefined();
	});

	it("returns undefined when the projects root does not exist", () => {
		expect(
			resolveSessionTranscript(SESSION_ID, join(projectsRoot, "missing")),
		).toBeUndefined();
	});

	it("strips command markers from the prompt", () => {
		writeTranscript("-home-dev-assist", SESSION_ID, [
			userLine(
				"<command-name>/verify</command-name><command-args></command-args>Run the checks",
				"2026-08-10T02:00:00.000Z",
			),
		]);

		expect(resolveSessionTranscript(SESSION_ID, projectsRoot)?.prompt).toBe(
			"Run the checks",
		);
	});

	it("omits metadata a transcript without prompts or timestamps cannot supply", () => {
		writeTranscript("-home-dev-assist", SESSION_ID, [
			{ type: "summary", summary: "no timestamps here" },
		]);

		const resolved = resolveSessionTranscript(SESSION_ID, projectsRoot);

		expect(resolved?.path).toContain(`${SESSION_ID}.jsonl`);
		expect(resolved?.prompt).toBeUndefined();
		expect(resolved?.firstTimestamp).toBeUndefined();
		expect(resolved?.lastTimestamp).toBeUndefined();
	});
});
