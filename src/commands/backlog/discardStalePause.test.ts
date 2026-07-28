import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearPause, isPausePending } from "./consumePause";
import { discardStalePause } from "./discardStalePause";

vi.mock("./consumePause", () => ({
	clearPause: vi.fn(),
	isPausePending: vi.fn(),
}));

vi.mock("../sessions/daemon/appendDaemonLog", () => ({
	appendDaemonLog: vi.fn(),
}));

const isPausePendingMock = isPausePending as unknown as ReturnType<
	typeof vi.fn
>;
const clearPauseMock = clearPause as unknown as ReturnType<typeof vi.fn>;

describe("discardStalePause", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete process.env.ASSIST_KEEP_PAUSE;
	});

	afterEach(() => {
		delete process.env.ASSIST_KEEP_PAUSE;
	});

	it("does nothing when no pause is pending", () => {
		isPausePendingMock.mockReturnValue(false);

		discardStalePause(42);

		expect(clearPauseMock).not.toHaveBeenCalled();
	});

	it("discards a prior run's leftover pause", () => {
		isPausePendingMock.mockReturnValue(true);

		discardStalePause(42);

		expect(clearPauseMock).toHaveBeenCalledWith(42);
	});

	it("keeps the pause when the daemon relaunched this run after a restore", () => {
		isPausePendingMock.mockReturnValue(true);
		process.env.ASSIST_KEEP_PAUSE = "1";

		discardStalePause(42);

		expect(clearPauseMock).not.toHaveBeenCalled();
	});
});
