import { describe, expect, it } from "vitest";
import {
	WINDOWS_BRIDGE_FAILURE_PREFIX,
	windowsBridgeFailureCause,
} from "./windowsBridgeFailureCause";

describe("windowsBridgeFailureCause", () => {
	it("extracts the cause from a timestamped daemon log line", () => {
		const line = `2026-08-13T22:44:01.000Z [1234] ${WINDOWS_BRIDGE_FAILURE_PREFIX} could not bind port 51764`;

		expect(windowsBridgeFailureCause(line)).toBe(
			`${WINDOWS_BRIDGE_FAILURE_PREFIX} could not bind port 51764`,
		);
	});

	it("ignores unrelated lines", () => {
		expect(windowsBridgeFailureCause("restored 2 session(s): 1, 2")).toBeNull();
	});
});
