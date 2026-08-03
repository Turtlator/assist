import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./spawnClaude", () => ({ spawnClaude: vi.fn(() => "claude-pty") }));
vi.mock("./hasTranscriptOnDisk", () => ({
	hasTranscriptOnDisk: vi.fn(() => true),
}));
vi.mock("../../backlog/buildResumePrompt", () => ({
	buildResumePrompt: vi.fn(() => "resume nudge"),
}));

import type { PersistedSession } from "./loadPersistedSessions";
import { restoreBase } from "./restoreBase";
import { restoreInteractiveSession } from "./restoreInteractiveSession";
import { spawnClaude } from "./spawnClaude";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;

function persistedSession(
	overrides: Partial<PersistedSession> = {},
): PersistedSession {
	return {
		name: "repo/Session 1",
		commandType: "claude",
		cwd: "/repo",
		startedAt: 1,
		...overrides,
	};
}

function restore(persisted: PersistedSession) {
	return restoreInteractiveSession(
		"1",
		persisted,
		restoreBase("1", persisted),
		false,
	);
}

describe("restoreInteractiveSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("for a claude session with a recorded conversation", () => {
		it("resumes it", () => {
			const session = restore(persistedSession({ claudeSessionId: "conv-1" }));

			expect(session.status).toBe("running");
			expect(mockSpawnClaude).toHaveBeenCalledWith(
				expect.objectContaining({ resumeSessionId: "conv-1" }),
			);
		});
	});

	describe("for a session on a harness that cannot resume", () => {
		it("does not resume it as claude, even with a stale conversation id", () => {
			const session = restore(
				persistedSession({ harness: "codex", claudeSessionId: "stale" }),
			);

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(session.status).toBe("error");
		});

		it("explains the harness cannot be resumed instead of blaming a missing claude id", () => {
			const session = restore(persistedSession({ harness: "codex" }));

			expect(session.error).toBe(
				"Codex sessions cannot be resumed yet, so the conversation cannot be restored",
			);
		});

		it("leaves an assist session as a retryable stub it can relaunch from its args", () => {
			const session = restore(
				persistedSession({
					commandType: "assist",
					harness: "codex",
					assistArgs: ["refine", "--harness", "codex", "a279"],
					claudeSessionId: "stale",
				}),
			);

			expect(mockSpawnClaude).not.toHaveBeenCalled();
			expect(session.status).toBe("done");
			expect(session.restored).toBe(false);
		});
	});

	describe("for a claude session with no recorded conversation", () => {
		it("keeps the existing unrecoverable-claude wording", () => {
			const session = restore(persistedSession());

			expect(session.error).toBe(
				"no claude session id was recorded before the daemon stopped, so the conversation cannot be resumed",
			);
		});
	});
});
