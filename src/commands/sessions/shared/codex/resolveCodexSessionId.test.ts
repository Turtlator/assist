import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPaths = vi.fn<() => Promise<string[]>>();

vi.mock("./discoverCodexRolloutPaths", () => ({
	discoverCodexRolloutPaths: () => mockPaths(),
}));

import { resolveCodexSessionId } from "./resolveCodexSessionId";

const dir = mkdtempSync(join(tmpdir(), "codex-resolve-"));

function rollout(sessionId: string, cwd: string, timestamp: string): string {
	const file = join(dir, `rollout-${sessionId}.jsonl`);
	writeFileSync(
		file,
		`${JSON.stringify({
			type: "session_meta",
			payload: { session_id: sessionId, cwd, timestamp },
		})}\n`,
	);
	return file;
}

const START = Date.parse("2026-08-09T11:00:00.000Z");

describe("resolveCodexSessionId", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("binds the newest conversation codex started in the session's cwd", async () => {
		mockPaths.mockResolvedValue([
			rollout("older", "/repo", "2026-08-09T11:01:00.000Z"),
			rollout("newest", "/repo", "2026-08-09T11:02:00.000Z"),
		]);

		expect(await resolveCodexSessionId("/repo", START)).toBe("newest");
	});

	it("ignores conversations from another working directory", async () => {
		mockPaths.mockResolvedValue([
			rollout("elsewhere", "/other", "2026-08-09T11:02:00.000Z"),
		]);

		expect(await resolveCodexSessionId("/repo", START)).toBeNull();
	});

	it("ignores conversations that started before the session did", async () => {
		mockPaths.mockResolvedValue([
			rollout("earlier", "/repo", "2026-08-09T10:59:00.000Z"),
		]);

		expect(await resolveCodexSessionId("/repo", START)).toBeNull();
	});

	it("resolves nothing without a cwd to match on", async () => {
		expect(await resolveCodexSessionId("", START)).toBeNull();
		expect(mockPaths).not.toHaveBeenCalled();
	});
});
