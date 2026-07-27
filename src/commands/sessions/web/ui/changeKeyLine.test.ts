import { describe, expect, it } from "vitest";
import { changeKeyLine } from "./changeKeyLine";

describe("changeKeyLine", () => {
	it("reads the line number off normal, insert and delete keys", () => {
		expect(changeKeyLine("N42")).toBe(42);
		expect(changeKeyLine("I17")).toBe(17);
		expect(changeKeyLine("D9")).toBe(9);
	});

	it("returns null for a missing or unrecognised key", () => {
		expect(changeKeyLine(undefined)).toBeNull();
		expect(changeKeyLine(null)).toBeNull();
		expect(changeKeyLine("X1")).toBeNull();
		expect(changeKeyLine("N")).toBeNull();
	});
});
