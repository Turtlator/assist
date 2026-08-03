import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("node:crypto", () => ({
	randomUUID: vi.fn(() => "generated-uuid"),
}));

vi.mock("../../shared/pullIfConfigured", () => ({
	pullIfConfigured: vi.fn(),
}));

vi.mock("../../shared/spawnHarness", () => ({
	spawnHarness: vi.fn(),
}));

vi.mock("./next", () => ({ next: vi.fn() }));
vi.mock("./readSignal", () => ({ readSignal: vi.fn() }));
vi.mock("./resolvePhaseResult", () => ({ cleanupSignal: vi.fn() }));
vi.mock("./tryRunById", () => ({ tryRunById: vi.fn() }));
vi.mock("./loadItem", () => ({ loadItem: vi.fn() }));
vi.mock("./shared", () => ({
	getReady: vi.fn().mockResolvedValue({ orm: {} }),
}));
vi.mock("../../shared/emitActivity", () => ({ emitActivity: vi.fn() }));
vi.mock("./watchForMarker", () => ({
	watchForMarker: vi.fn(),
	stopWatching: vi.fn(),
}));

import { emitActivity } from "../../shared/emitActivity";
import { spawnHarness } from "../../shared/spawnHarness";
import { launchMode } from "./launchMode";
import { watchForMarker } from "./watchForMarker";

const mockEmitActivity = emitActivity as unknown as MockInstance;
const mockSpawnHarness = spawnHarness as unknown as MockInstance;
const mockWatchForMarker = watchForMarker as unknown as MockInstance;

const child = { kill: vi.fn() };

describe("launchMode harness dispatch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockSpawnHarness.mockReturnValue({ child, done: Promise.resolve(0) });
		mockWatchForMarker.mockReturnValue({ killedOnMarker: () => false });
	});

	it("dispatches to the codex harness with the slash prompt and current cwd", async () => {
		await launchMode("refine a279", { harness: "codex" });

		expect(mockSpawnHarness).toHaveBeenCalledWith("codex", "/refine a279", {
			sessionId: "generated-uuid",
			resumeSessionId: undefined,
			cwd: process.cwd(),
		});
	});

	it("defaults to the claude harness when none is given", async () => {
		await launchMode("refine a279");

		expect(mockSpawnHarness).toHaveBeenCalledWith(
			"claude",
			"/refine a279",
			expect.objectContaining({ sessionId: "generated-uuid" }),
		);
	});

	it("reports the harness in its activity so the card badges the session", async () => {
		await launchMode("refine a279", { harness: "codex", itemId: 279 });

		expect(mockEmitActivity).toHaveBeenCalledWith({
			kind: "command",
			name: "refine a279",
			itemId: 279,
			itemName: undefined,
			harness: "codex",
		});
	});

	it("withholds the claude conversation id for a non-claude harness", async () => {
		await launchMode("refine a279", { harness: "codex" });

		expect(mockEmitActivity.mock.calls[0][0].claudeSessionId).toBeUndefined();
	});

	it("still reports the claude conversation id and no harness for claude", async () => {
		await launchMode("refine a279");

		expect(mockEmitActivity).toHaveBeenCalledWith({
			kind: "command",
			name: "refine a279",
			itemId: undefined,
			itemName: undefined,
			claudeSessionId: "generated-uuid",
		});
	});
});
