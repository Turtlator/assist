import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("node:crypto", () => ({ randomUUID: vi.fn(() => "fresh-uuid") }));
vi.mock("./spawnClaude", () => ({ spawnClaude: vi.fn(() => "claude-pty") }));
vi.mock("./spawnPty", () => ({ spawnPty: vi.fn(() => "assist-pty") }));

import type { Session } from "./createSession";
import { respawnPlan } from "./respawnPlan";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

const mockSpawnClaude = spawnClaude as unknown as MockInstance;
const mockSpawnPty = spawnPty as unknown as MockInstance;

function fakeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		name: "s",
		commandType: "claude",
		status: "running",
		startedAt: 1,
		runningMs: 0,
		runningSince: 1,
		waitingSince: null,
		pty: null,
		scrollback: "",
		cwd: "/repo",
		...overrides,
	} as Session;
}

describe("respawnPlan", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("for a claude session", () => {
		it("resumes the recorded conversation", () => {
			const plan = respawnPlan(
				fakeSession({ claudeSessionId: "conv-1" }),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(plan.status).toBe("waiting");
			expect(mockSpawnClaude).toHaveBeenCalledWith({
				resumeSessionId: "conv-1",
				cwd: "/repo",
				sessionId: "1",
			});
		});

		it("starts a fresh conversation in the cwd when none was recorded", () => {
			const plan = respawnPlan(fakeSession());

			expect(plan?.status).toBe("waiting");
		});
	});

	describe("for an interactive session on a harness that cannot resume", () => {
		it("has no plan rather than respawning it as claude", () => {
			expect(
				respawnPlan(
					fakeSession({ harness: "codex", initialPrompt: "/refine a279" }),
				),
			).toBeNull();
			expect(respawnPlan(fakeSession({ harness: "pi" }))).toBeNull();
			expect(mockSpawnClaude).not.toHaveBeenCalled();
		});
	});

	describe("for an assist session on a harness that cannot resume", () => {
		it("relaunches the command without a claude resume flag", () => {
			const plan = respawnPlan(
				fakeSession({
					commandType: "assist",
					harness: "codex",
					assistArgs: ["refine", "--once", "--harness", "codex", "a279"],
					claudeSessionId: "stale-conv",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnPty).toHaveBeenCalledWith(
				["assist", "refine", "--once", "--harness", "codex", "a279"],
				"/repo",
				"1",
				undefined,
			);
		});
	});

	describe("for an assist session on claude", () => {
		it("keeps resuming the recorded conversation", () => {
			const plan = respawnPlan(
				fakeSession({
					commandType: "assist",
					assistArgs: ["draft"],
					claudeSessionId: "conv-2",
				}),
			) as NonNullable<ReturnType<typeof respawnPlan>>;
			plan.spawn();

			expect(mockSpawnPty).toHaveBeenCalledWith(
				["assist", "draft", "--resume-session", "conv-2"],
				"/repo",
				"1",
				undefined,
			);
		});
	});
});
