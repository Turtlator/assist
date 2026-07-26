import { describe, expect, it } from "vitest";
import { detectMovement } from "./detectMovement";

describe("detectMovement", () => {
	it("reports movement when the upstream is ahead of HEAD", () => {
		expect(detectMovement("aaa", "bbb", 3)).toEqual({
			from: "aaa",
			to: "bbb",
			count: 3,
		});
	});

	it("reports nothing when HEAD and the upstream are the same commit", () => {
		expect(detectMovement("aaa", "aaa", 0)).toBeUndefined();
	});

	it("reports nothing when the shas differ only because HEAD is ahead", () => {
		expect(detectMovement("bbb", "aaa", 0)).toBeUndefined();
	});

	it("reports nothing when the commit count is not a number", () => {
		expect(detectMovement("aaa", "bbb", Number.NaN)).toBeUndefined();
	});
});
