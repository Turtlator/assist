import { beforeEach, describe, expect, it, vi } from "vitest";
import { isPausePending } from "../../backlog/consumePause";
import type { PersistedSession } from "./persistedSessionSchema";
import { restoredAutoAdvance } from "./restoredAutoAdvance";

vi.mock("../../backlog/consumePause", () => ({ isPausePending: vi.fn() }));
vi.mock("./daemonLog", () => ({ daemonLog: vi.fn() }));

const isPausePendingMock = isPausePending as unknown as ReturnType<
	typeof vi.fn
>;

function persisted(
	overrides: Partial<PersistedSession> = {},
): PersistedSession {
	return {
		name: "s",
		commandType: "assist",
		cwd: "/repo",
		startedAt: 1,
		activity: { kind: "backlog", itemId: 42, startedAt: 1 },
		...overrides,
	};
}

describe("restoredAutoAdvance", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		isPausePendingMock.mockReturnValue(false);
	});

	it("keeps a persisted off state", () => {
		expect(restoredAutoAdvance("1", persisted({ autoAdvance: false }))).toBe(
			false,
		);
	});

	it("keeps a persisted on state", () => {
		expect(restoredAutoAdvance("1", persisted({ autoAdvance: true }))).toBe(
			true,
		);
	});

	it("leaves an untouched toggle undefined so the default applies", () => {
		expect(restoredAutoAdvance("1", persisted())).toBeUndefined();
	});

	it("forces off when a pause is still pending for the item", () => {
		isPausePendingMock.mockReturnValue(true);

		expect(restoredAutoAdvance("1", persisted({ autoAdvance: true }))).toBe(
			false,
		);
		expect(isPausePendingMock).toHaveBeenCalledWith(42);
	});

	it("ignores the control file for a session with no backlog item", () => {
		isPausePendingMock.mockReturnValue(true);

		expect(
			restoredAutoAdvance(
				"1",
				persisted({ activity: undefined, autoAdvance: true }),
			),
		).toBe(true);
		expect(isPausePendingMock).not.toHaveBeenCalled();
	});
});
