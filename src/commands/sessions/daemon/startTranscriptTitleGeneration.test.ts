import { beforeEach, describe, expect, it, vi } from "vitest";
import { findTranscriptPathSync } from "../shared/findTranscriptPathSync";
import { extractFirstUserMessage } from "../summarise/extractFirstUserMessage";
import { daemonLog } from "./daemonLog";
import { generateSessionTitle } from "./generateSessionTitle";
import { startTranscriptTitleGeneration } from "./startTranscriptTitleGeneration";
import type { Session } from "./types";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("./generateSessionTitle", () => ({
	generateSessionTitle: vi.fn(async () => "Add dark mode"),
	SESSION_TITLE_MAX_LENGTH: 48,
}));
vi.mock("../summarise/extractFirstUserMessage", () => ({
	extractFirstUserMessage: vi.fn(() => "please add dark mode to settings"),
}));
vi.mock("../shared/findTranscriptPathSync", () => ({
	findTranscriptPathSync: vi.fn(() => "/projects/repo/abc.jsonl"),
}));

const mockGenerate = generateSessionTitle as unknown as ReturnType<
	typeof vi.fn
>;
const mockLog = daemonLog as unknown as ReturnType<typeof vi.fn>;
const mockExtract = extractFirstUserMessage as unknown as ReturnType<
	typeof vi.fn
>;
const mockFindPath = findTranscriptPathSync as unknown as ReturnType<
	typeof vi.fn
>;

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
		cwd: "/home/me/repo",
		claudeSessionId: "abc",
		transcriptPath: "/projects/repo/abc.jsonl",
		...overrides,
	};
}

async function flush(): Promise<void> {
	await new Promise((resolve) => setImmediate(resolve));
}

describe("startTranscriptTitleGeneration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGenerate.mockResolvedValue("Add dark mode");
		mockExtract.mockReturnValue("please add dark mode to settings");
		mockFindPath.mockReturnValue("/projects/repo/abc.jsonl");
	});

	it("titles a promptless session from its first transcript message", async () => {
		const session = makeSession();
		const notify = vi.fn();

		startTranscriptTitleGeneration(session, notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledWith(
			"please add dark mode to settings",
		);
		expect(session.generatedTitle).toBe("Add dark mode");
		expect(notify).toHaveBeenCalledOnce();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 deriving title from first transcript message",
		);
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 generated title: Add dark mode",
		);
	});

	it("generates once no matter how often the watcher fires", async () => {
		const session = makeSession();
		const notify = vi.fn();

		startTranscriptTitleGeneration(session, notify);
		startTranscriptTitleGeneration(session, notify);
		startTranscriptTitleGeneration(session, notify);
		await flush();
		startTranscriptTitleGeneration(session, notify);
		await flush();

		expect(mockGenerate).toHaveBeenCalledOnce();
		expect(notify).toHaveBeenCalledOnce();
	});

	it("skips a session that already carries a generated title", () => {
		startTranscriptTitleGeneration(
			makeSession({ generatedTitle: "Add dark mode" }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(mockExtract).not.toHaveBeenCalled();
	});

	it("skips a session whose generation is already in flight", () => {
		startTranscriptTitleGeneration(
			makeSession({ titleGenerationStarted: true }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(mockExtract).not.toHaveBeenCalled();
	});

	it("leaves prompted sessions to the spawn-time path", () => {
		startTranscriptTitleGeneration(
			makeSession({ initialPrompt: "the login page redirects" }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("skips sessions that are not plain claude sessions", () => {
		startTranscriptTitleGeneration(
			makeSession({ commandType: "run", runName: "build" }),
			vi.fn(),
		);

		expect(mockGenerate).not.toHaveBeenCalled();
	});

	it("stays retryable while the transcript has no user message yet", async () => {
		const session = makeSession();
		mockExtract.mockReturnValueOnce(undefined);

		startTranscriptTitleGeneration(session, vi.fn());

		expect(mockGenerate).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();

		startTranscriptTitleGeneration(session, vi.fn());
		await flush();

		expect(mockGenerate).toHaveBeenCalledOnce();
		expect(session.generatedTitle).toBe("Add dark mode");
	});

	it("falls back to locating the transcript when the path is unresolved", async () => {
		startTranscriptTitleGeneration(
			makeSession({ transcriptPath: undefined }),
			vi.fn(),
		);
		await flush();

		expect(mockFindPath).toHaveBeenCalledWith("/home/me/repo", "abc");
		expect(mockExtract).toHaveBeenCalledWith("/projects/repo/abc.jsonl");
	});

	it("keeps the Session placeholder when generation fails", async () => {
		mockGenerate.mockResolvedValue(undefined);
		const session = makeSession();
		const notify = vi.fn();

		startTranscriptTitleGeneration(session, notify);
		await flush();

		expect(session.generatedTitle).toBeUndefined();
		expect(notify).not.toHaveBeenCalled();
		expect(mockLog).toHaveBeenCalledWith(
			"session 7 title generation failed; keeping placeholder title",
		);
	});

	it("stays retryable while no transcript exists on disk", () => {
		const session = makeSession({ transcriptPath: undefined });
		mockFindPath.mockReturnValue(null);

		startTranscriptTitleGeneration(session, vi.fn());

		expect(mockExtract).not.toHaveBeenCalled();
		expect(session.titleGenerationStarted).toBeUndefined();
	});
});
