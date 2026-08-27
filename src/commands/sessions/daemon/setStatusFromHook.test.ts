import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { setStatusFromHook } from "./setStatusFromHook";
import { watchTranscript } from "./watchTranscript";

vi.mock("./watchTranscript", () => ({ watchTranscript: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const watchMock = watchTranscript as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "3",
		status: "waiting",
		cwd: "/home/me/repo",
		claudeSessionId: "before-clear",
		...overrides,
	} as unknown as Session;
}

describe("setStatusFromHook", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("rebinds to the post-/clear conversation before applying the status", () => {
		const s = session();
		const onStatusChange = vi.fn();
		const notify = vi.fn();

		setStatusFromHook(
			new Map([[s.id, s]]),
			{
				id: s.id,
				status: "running",
				source: "prompt",
				claudeSessionId: "after-clear",
			},
			notify,
			onStatusChange,
		);

		expect(s.claudeSessionId).toBe("after-clear");
		expect(watchMock).toHaveBeenCalledWith(s, notify, onStatusChange);
		expect(onStatusChange).toHaveBeenCalledWith(s, "running");
	});

	it("leaves the watcher alone for a hook from the bound conversation", () => {
		const s = session();

		setStatusFromHook(
			new Map([[s.id, s]]),
			{ id: s.id, status: "running", claudeSessionId: "before-clear" },
			vi.fn(),
			vi.fn(),
		);

		expect(watchMock).not.toHaveBeenCalled();
	});
});
