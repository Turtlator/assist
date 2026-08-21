import { describe, expect, it } from "vitest";
import { parseTypeChain } from "./parseTypeChain";

describe("parseTypeChain", () => {
	it("reads a comma-separated chain parent level first", () => {
		expect(parseTypeChain("Initiative,Feature,Task")).toEqual([
			"Initiative",
			"Feature",
			"Task",
		]);
	});

	it("trims the levels and accepts the > form it prints", () => {
		expect(parseTypeChain(" Epic > Story > Sub-task ")).toEqual([
			"Epic",
			"Story",
			"Sub-task",
		]);
	});

	it("refuses a chain with fewer than two levels", () => {
		expect(() => parseTypeChain("Epic")).toThrow(/at least two levels/);
		expect(() => parseTypeChain(" , ")).toThrow(/at least two levels/);
	});

	it("refuses a chain that repeats a level under loose matching", () => {
		expect(() => parseTypeChain("Epic,Story,Sub-task,subtask")).toThrow(
			/repeats subtask/,
		);
	});
});
