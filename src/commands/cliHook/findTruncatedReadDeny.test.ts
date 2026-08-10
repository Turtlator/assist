import { describe, expect, it } from "vitest";
import { findTruncatedReadDeny } from "./findTruncatedReadDeny";

describe("findTruncatedReadDeny", () => {
	it("denies backlog show piped to head", () => {
		const decision = findTruncatedReadDeny([
			"assist backlog show a930",
			"head -60",
		]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist backlog comments",
		);
	});

	it("denies the view alias", () => {
		expect(
			findTruncatedReadDeny(["assist backlog view a930", "head -60"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies tail as well as head", () => {
		expect(
			findTruncatedReadDeny(["assist backlog show a930", "tail -20"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies a truncator reached by an absolute path", () => {
		expect(
			findTruncatedReadDeny(["assist backlog show a930", "/usr/bin/head -5"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies a raw command that could not be split into parts", () => {
		expect(
			findTruncatedReadDeny(["assist backlog view a930 2>&1 | head -60"])
				?.permissionDecision,
		).toBe("deny");
	});

	it("denies when the truncator follows an intermediate filter", () => {
		expect(
			findTruncatedReadDeny([
				"assist backlog show a930",
				"grep -n Comments",
				"head -5",
			])?.permissionDecision,
		).toBe("deny");
	});

	it("allows a bare backlog show", () => {
		expect(findTruncatedReadDeny(["assist backlog show a930"])).toBeUndefined();
	});

	it("allows piping backlog show to a filter that does not truncate", () => {
		expect(
			findTruncatedReadDeny(["assist backlog show a930", "grep -n Comments"]),
		).toBeUndefined();
	});

	it("allows head on an unrelated command", () => {
		expect(
			findTruncatedReadDeny(["git log --oneline", "head -5"]),
		).toBeUndefined();
	});

	it("does not match a different backlog subcommand", () => {
		expect(
			findTruncatedReadDeny(["assist backlog comments a930", "head -20"]),
		).toBeUndefined();
	});

	it("does not match a command that merely mentions the read as an argument", () => {
		expect(
			findTruncatedReadDeny(["echo assist backlog show a930", "head -5"]),
		).toBeUndefined();
	});
});
