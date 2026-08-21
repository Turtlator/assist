import { describe, expect, it } from "vitest";
import { resolveLevelIndex } from "./resolveLevelIndex";
import { defaultTypeChain } from "./types";

describe("resolveLevelIndex", () => {
	it("matches a chain level by name", () => {
		expect(resolveLevelIndex(defaultTypeChain, "Epic")).toBe(0);
		expect(resolveLevelIndex(defaultTypeChain, "Story")).toBe(1);
	});

	it("matches loosely so Subtask and Sub-task both bind to the leaf", () => {
		expect(resolveLevelIndex(defaultTypeChain, "Subtask")).toBe(2);
		expect(resolveLevelIndex(defaultTypeChain, "Sub-task")).toBe(2);
		expect(resolveLevelIndex(defaultTypeChain, "sub task")).toBe(2);
	});

	it("reports no match for a type outside the chain or no type at all", () => {
		expect(resolveLevelIndex(defaultTypeChain, "Feature")).toBe(-1);
		expect(resolveLevelIndex(defaultTypeChain, null)).toBe(-1);
		expect(resolveLevelIndex(defaultTypeChain, undefined)).toBe(-1);
	});
});
