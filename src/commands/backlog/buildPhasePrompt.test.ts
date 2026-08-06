import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../../shared/loadConfig";
import { buildPhasePrompt } from "./buildPhasePrompt";
import type { BacklogItem, PlanPhase } from "./types";

vi.mock("../../shared/loadConfig", () => ({ loadConfig: vi.fn() }));

const loadConfigMock = vi.mocked(loadConfig);

function makeItem(): BacklogItem {
	return {
		id: 7,
		type: "story",
		name: "Test item",
		acceptanceCriteria: ["AC1"],
		status: "in-progress",
		starred: false,
	};
}

const phase: PlanPhase = { name: "Phase 1", tasks: [{ task: "do it" }] };

function mockWorktree(worktree: Record<string, unknown>): void {
	loadConfigMock.mockReturnValue({ worktree } as unknown as ReturnType<
		typeof loadConfig
	>);
}

const COMMIT_LINE =
	"Once verify passes, run /commit to commit the work before marking this phase as done.";

describe("buildPhasePrompt", () => {
	beforeEach(() => {
		loadConfigMock.mockReset();
	});

	it("adds no commit instruction when neither key is set", () => {
		mockWorktree({ enabled: true });

		expect(buildPhasePrompt(makeItem(), 1, phase)).not.toContain("/commit");
	});

	it("adds no commit instruction when there is no worktree config at all", () => {
		loadConfigMock.mockReturnValue(
			{} as unknown as ReturnType<typeof loadConfig>,
		);

		expect(buildPhasePrompt(makeItem(), 1, phase)).not.toContain("/commit");
	});

	it("honours worktree.commitBeforePhaseEnd", () => {
		mockWorktree({ commitBeforePhaseEnd: true });

		expect(buildPhasePrompt(makeItem(), 1, phase)).toContain(COMMIT_LINE);
	});

	it("falls back to worktree.commitBeforeManualChecks when the new key is unset", () => {
		mockWorktree({ commitBeforeManualChecks: true });

		expect(buildPhasePrompt(makeItem(), 1, phase)).toContain(COMMIT_LINE);
	});

	it("lets the new key win when both are set", () => {
		mockWorktree({
			commitBeforePhaseEnd: false,
			commitBeforeManualChecks: true,
		});

		expect(buildPhasePrompt(makeItem(), 1, phase)).not.toContain("/commit");

		mockWorktree({
			commitBeforePhaseEnd: true,
			commitBeforeManualChecks: false,
		});

		expect(buildPhasePrompt(makeItem(), 1, phase)).toContain(COMMIT_LINE);
	});
});
