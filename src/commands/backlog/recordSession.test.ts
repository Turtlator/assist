import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("./addActivity", () => ({ addActivity: vi.fn() }));

vi.mock("../sessions/shared/resolveCurrentSessionId", () => ({
	resolveCurrentSessionId: vi.fn(),
}));

import { resolveCurrentSessionId } from "../sessions/shared/resolveCurrentSessionId";
import { addActivity } from "./addActivity";
import { recordSession } from "./recordSession";

const mockAddActivity = addActivity as unknown as MockInstance;
const mockResolveCurrent = resolveCurrentSessionId as unknown as MockInstance;

const DETECTED = "991a1fde-669f-43f0-9b30-60892465b411";
const OVERRIDE = "7c8a778a-19ae-4dd9-abcc-e589a2e352ff";

let logSpy: MockInstance;

beforeEach(() => {
	logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
	process.exitCode = undefined;
	mockResolveCurrent.mockReturnValue(DETECTED);
});

afterEach(() => {
	logSpy.mockRestore();
	mockAddActivity.mockReset();
	mockResolveCurrent.mockReset();
	process.exitCode = undefined;
});

describe("recordSession", () => {
	it("attaches the detected session to the item", async () => {
		await recordSession("a922", {});

		expect(mockAddActivity).toHaveBeenCalledWith(
			"a922",
			"session",
			DETECTED,
			{},
		);
		expect(process.exitCode).toBeUndefined();
	});

	it("attaches an explicit session id without detecting one", async () => {
		await recordSession("a922", { session: OVERRIDE });

		expect(mockResolveCurrent).not.toHaveBeenCalled();
		expect(mockAddActivity).toHaveBeenCalledWith(
			"a922",
			"session",
			OVERRIDE,
			{},
		);
	});

	it("fails with guidance when the current session cannot be detected", async () => {
		mockResolveCurrent.mockReturnValue(undefined);

		await recordSession("a922", {});

		expect(mockAddActivity).not.toHaveBeenCalled();
		expect(process.exitCode).toBe(1);
		expect(logSpy.mock.calls.flat().join(" ")).toContain("--session");
	});
});
