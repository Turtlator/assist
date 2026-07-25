import { describe, expect, it } from "vitest";
import type { SessionInfo } from "../../../../sessions/web/ui/types";
import { runInFlightSession } from "./runInFlightSession";

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
	return {
		id: "4",
		name: "assist backlog run a775",
		commandType: "assist",
		startedAt: 1,
		status: "running",
		assistArgs: ["backlog", "run", "a775"],
		...overrides,
	};
}

describe("runInFlightSession", () => {
	it("finds a live run from its launch args before any activity is reported", () => {
		expect(runInFlightSession([session()], 775)?.id).toBe("4");
	});

	it("finds a run whose card was reused by an auto-run chain", () => {
		const chained = session({
			assistArgs: ["draft", "--once", "something"],
			activity: { kind: "backlog", itemId: 775, startedAt: 1 },
		});

		expect(runInFlightSession([chained], 775)?.id).toBe("4");
	});

	it("ignores a run of a different item", () => {
		expect(runInFlightSession([session()], 772)).toBeUndefined();
	});

	it("ignores finished cards so the item can be run again", () => {
		expect(
			runInFlightSession([session({ status: "done" })], 775),
		).toBeUndefined();
		expect(
			runInFlightSession([session({ status: "error" })], 775),
		).toBeUndefined();
	});

	it("treats a stopped card as still holding the item", () => {
		expect(runInFlightSession([session({ status: "stopped" })], 775)?.id).toBe(
			"4",
		);
	});

	it("ignores sessions that are not backlog runs", () => {
		const refine = session({ assistArgs: ["refine", "--once", "a775"] });

		expect(runInFlightSession([refine], 775)).toBeUndefined();
	});
});
