import { beforeEach, describe, expect, it, vi } from "vitest";
import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { startSessionTitleGeneration } from "./startSessionTitleGeneration";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./generateSessionTitle", () => ({
	generateSessionTitle: vi.fn(async () => "Fix login redirect"),
	SESSION_TITLE_MAX_LENGTH: 48,
}));

const mockGenerate = generateSessionTitle as unknown as ReturnType<
	typeof vi.fn
>;
const mockLog = daemonLog as unknown as ReturnType<typeof vi.fn>;

function makeSession(overrides: Partial<Session>): Session {
	return {
		id: "7",
		name: "Session 7",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

async function flush(): Promise<void> {
	await new Promise((resolve) => setImmediate(resolve));
}

describe("startSessionTitleGeneration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGenerate.mockResolvedValue("Fix login redirect");
	});

	it("assigns, logs and broadcasts a title for a prompted claude session", async () => {
		const session = makeSession({ initialPrompt: "the login page redirects" });
		const notify = vi.fn();

		startSessionTitleGeneration(session, notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith("the login page redirects");
		expect(session.generatedTitle).toBe("Fix login redirect");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 generated title: Fix login redirect",
		);
	});

	it("returns before spawning anything for a promptless session", () => {
		const notify = vi.fn();

		startSessionTitleGeneration(makeSession({}), notify);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(notify).not.toHaveBeenCalled();
	});

	it("summarises the prompt text of a draft card", async () => {
		const session = makeSession({
			commandType: "assist",
			assistArgs: ["draft", "--once", "add dark mode to the settings page"],
		});

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith(
			"add dark mode to the settings page",
		);
	});

	it("skips a draft card launched without prompt text", () => {
		startSessionTitleGeneration(
			makeSession({ commandType: "assist", assistArgs: ["draft", "--once"] }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips a refine card whose only arg is a backlog item id", () => {
		startSessionTitleGeneration(
			makeSession({
				commandType: "assist",
				assistArgs: ["refine", "--once", "254"],
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips assist commands outside draft, bug and refine", () => {
		startSessionTitleGeneration(
			makeSession({
				commandType: "assist",
				assistArgs: ["next", "--once", "some text"],
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips run sessions", () => {
		startSessionTitleGeneration(
			makeSession({ commandType: "run", runName: "build" }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips a session that already carries a generated title", () => {
		startSessionTitleGeneration(
			makeSession({
				initialPrompt: "the login page redirects",
				generatedTitle: "Fix login redirect",
			}),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("falls back to a single line of the prompt when generation fails", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession({
			initialPrompt: "the login page\nredirects  badly",
		});
		const notify = vi.fn();

		startSessionTitleGeneration(session, notify);
		await flush();

		expect(session.generatedTitle).toBe("the login page redirects badly");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			'session 7 title generation failed; falling back to "the login page redirects badly"',
		);
	});

	it("caps the fallback so a failed card never wraps", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession({ initialPrompt: "a ".repeat(200) });

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(session.generatedTitle).toHaveLength(48);
	});

	it("does not throw when generation rejects", async () => {
		mockGenerate.mockRejectedValue(new Error("boom"));
		const session = makeSession({ initialPrompt: "the login page redirects" });

		startSessionTitleGeneration(session, vi.fn());
		await flush();

		expect(session.generatedTitle).toBeUndefined();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 title generation errored: Error: boom",
		);
	});
});
