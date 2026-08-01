import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { setStatus } from "./setStatus";

vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const daemonLogMock = daemonLog as unknown as ReturnType<typeof vi.fn>;

function session(overrides: Partial<Session> = {}): Session {
	return {
		id: "1",
		status: "running",
		runningMs: 0,
		runningSince: null,
		...overrides,
	} as Session;
}

describe("setStatus verifying", () => {
	beforeEach(() => daemonLogMock.mockClear());

	it("clears a verifying flag stranded by a session that finished", () => {
		const s = session({ verifying: true });

		setStatus(s, "done");

		expect(s.verifying).toBe(false);
		expect(daemonLogMock).toHaveBeenCalledWith(
			"session 1 verifying cleared: status=done",
		);
	});

	it("holds the flag while the session stays running", () => {
		const s = session({ verifying: true });

		setStatus(s, "running");

		expect(s.verifying).toBe(true);
	});

	it("says nothing about verify for a session that was not verifying", () => {
		const s = session();

		setStatus(s, "stopped");

		expect(daemonLogMock).not.toHaveBeenCalled();
	});
});
