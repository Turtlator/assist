import { describe, expect, it } from "vitest";
import { isCommittingArgs } from "./isCommittingArgs";

describe("isCommittingArgs", () => {
	it("recognises a backlog run of a prefixed item id", () => {
		expect(isCommittingArgs(["backlog", "run", "a825"])).toBe(true);
	});

	it("recognises a backlog run of a bare numeric id", () => {
		expect(isCommittingArgs(["backlog", "run", "825"])).toBe(true);
	});

	it("recognises an id that follows a flag", () => {
		expect(isCommittingArgs(["backlog", "run", "--write", "a825"])).toBe(true);
	});

	it("treats a backlog run with no item id as no commit", () => {
		expect(isCommittingArgs(["backlog", "run"])).toBe(false);
		expect(isCommittingArgs(["backlog", "run", "--write"])).toBe(false);
	});

	it("ignores other backlog subcommands", () => {
		expect(isCommittingArgs(["backlog", "view", "a825"])).toBe(false);
	});

	it("delegates PR checkouts", () => {
		expect(isCommittingArgs(["review", "123"])).toBe(true);
		expect(isCommittingArgs(["review-pr-comments", "123"])).toBe(true);
		expect(isCommittingArgs(["review"])).toBe(false);
	});

	it("ignores draft-like commands and empty args", () => {
		expect(isCommittingArgs(["draft"])).toBe(false);
		expect(isCommittingArgs([])).toBe(false);
	});
});
