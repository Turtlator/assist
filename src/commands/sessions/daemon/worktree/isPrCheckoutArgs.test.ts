import { describe, expect, it } from "vitest";
import { isPrCheckoutArgs } from "./isPrCheckoutArgs";

describe("isPrCheckoutArgs", () => {
	it("recognises a review of a numbered PR", () => {
		expect(isPrCheckoutArgs(["review", "123"])).toBe(true);
	});

	it("recognises a comment pass on a numbered PR", () => {
		expect(isPrCheckoutArgs(["review-pr-comments", "123"])).toBe(true);
	});

	it("recognises a conflict fix on a numbered PR", () => {
		expect(isPrCheckoutArgs(["fix-conflict", "123"])).toBe(true);
		expect(isPrCheckoutArgs(["fix-conflict", "--rebase", "123"])).toBe(true);
	});

	it("recognises a number that follows a flag", () => {
		expect(isPrCheckoutArgs(["review", "--force", "123"])).toBe(true);
	});

	it("treats a review of the current branch as no checkout", () => {
		expect(isPrCheckoutArgs(["review"])).toBe(false);
		expect(isPrCheckoutArgs(["review", "--refine"])).toBe(false);
		expect(isPrCheckoutArgs(["review-pr-comments"])).toBe(false);
		expect(isPrCheckoutArgs(["fix-conflict", "--rebase"])).toBe(false);
	});

	it("ignores other commands and empty args", () => {
		expect(isPrCheckoutArgs(["backlog", "run", "123"])).toBe(false);
		expect(isPrCheckoutArgs([])).toBe(false);
	});
});
