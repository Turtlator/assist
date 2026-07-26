import { beforeEach, describe, expect, it, vi } from "vitest";
import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { runSessionTitleGeneration } from "./runSessionTitleGeneration";
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

function makeSession(overrides: Partial<Session> = {}): Session {
	return {
		id: "7",
		name: "Session 7",
		commandType: "claude",
		status: "running",
		startedAt: 0,
		runningMs: 0,
		runningSince: null,
		waitingSince: null,
		pty: null,
		scrollback: "",
		...overrides,
	};
}

async function flush(): Promise<void> {
	await new Promise((resolve) => setImmediate(resolve));
}

describe("runSessionTitleGeneration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGenerate.mockResolvedValue("Fix login redirect");
	});

	it("marks generation as started before the first await", () => {
		const session = makeSession();

		runSessionTitleGeneration(session, "the login page redirects", vi.fn());

		expect(session.titleGenerationStarted).toBe(true);
	});

	it("runs at most once for a session", async () => {
		const session = makeSession();
		const notify = vi.fn();

		runSessionTitleGeneration(session, "first", notify);
		runSessionTitleGeneration(session, "second", notify);
		await flush();
		runSessionTitleGeneration(session, "third", notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledOnce();
		expect(mockGenerate).toHaveBeenCalledWith("first");
		expect(notify).toHaveBeenCalledOnce();
	});

	it("stays locked in after a failed attempt fell back to the prompt", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession();

		runSessionTitleGeneration(
			session,
			"the login page redirects",
			vi.fn(),
			"the login page redirects",
		);
		await flush();
		runSessionTitleGeneration(session, "the login page redirects", vi.fn());

		expect(mockGenerate).toHaveBeenCalledOnce();
		expect(session.generatedTitle).toBe("the login page redirects");
	});

	it("prefers the generated title over the fallback", async () => {
		const session = makeSession();

		runSessionTitleGeneration(
			session,
			"the login page redirects",
			vi.fn(),
			"the login page redirects",
		);
		await flush();

		expect(session.generatedTitle).toBe("Fix login redirect");
	});

	it("takes the supplied fallback when generation yields nothing", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession();
		const notify = vi.fn();

		runSessionTitleGeneration(
			session,
			"a long prompt",
			notify,
			"a long prompt",
		);
		await flush();

		expect(session.generatedTitle).toBe("a long prompt");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			'session 7 title generation failed; falling back to "a long prompt"',
		);
	});

	it("keeps the placeholder name when no fallback was supplied", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession();
		const notify = vi.fn();

		runSessionTitleGeneration(session, "what is the capital of NY", notify);
		await flush();

		expect(session.generatedTitle).toBeUndefined();
		expect(notify).not.toHaveBeenCalled();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 title generation failed; keeping placeholder title",
		);
	});

	it("does not retry after generation rejects", async () => {
		mockGenerate.mockRejectedValue(new Error("boom"));
		const session = makeSession();

		runSessionTitleGeneration(session, "the login page redirects", vi.fn());
		await flush();
		runSessionTitleGeneration(session, "the login page redirects", vi.fn());

		expect(mockGenerate).toHaveBeenCalledOnce();
	});

	it("skips a session that already carries a generated title", () => {
		runSessionTitleGeneration(
			makeSession({ generatedTitle: "Fix login redirect" }),
			"the login page redirects",
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});
});
