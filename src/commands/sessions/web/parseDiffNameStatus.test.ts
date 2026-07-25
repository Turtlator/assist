import { describe, expect, it } from "vitest";
import { parseDiffNameStatus } from "./parseDiffNameStatus";

describe("parseDiffNameStatus", () => {
	it("groups added files as new", () => {
		expect(parseDiffNameStatus("A\tadded.ts")).toEqual({
			new: ["added.ts"],
			modified: [],
			deleted: [],
		});
	});

	it("groups copied files as new, using the new path", () => {
		expect(parseDiffNameStatus("C075\torig.ts\tcopy.ts")).toEqual({
			new: ["copy.ts"],
			modified: [],
			deleted: [],
		});
	});

	it("groups deleted files as deleted", () => {
		expect(parseDiffNameStatus("D\tgone.ts")).toEqual({
			new: [],
			modified: [],
			deleted: ["gone.ts"],
		});
	});

	it("groups modified files as modified", () => {
		expect(parseDiffNameStatus("M\tchanged.ts")).toEqual({
			new: [],
			modified: ["changed.ts"],
			deleted: [],
		});
	});

	it("groups renamed files as modified, using the new path", () => {
		expect(parseDiffNameStatus("R100\told.ts\tnew.ts")).toEqual({
			new: [],
			modified: ["new.ts"],
			deleted: [],
		});
	});

	it("groups type changes as modified", () => {
		expect(parseDiffNameStatus("T\tsymlink.ts")).toEqual({
			new: [],
			modified: ["symlink.ts"],
			deleted: [],
		});
	});

	it("groups unmerged paths as modified", () => {
		expect(parseDiffNameStatus("U\tconflicted.ts")).toEqual({
			new: [],
			modified: ["conflicted.ts"],
			deleted: [],
		});
	});

	it("ignores unknown status codes", () => {
		expect(parseDiffNameStatus("X\tmystery.ts")).toEqual({
			new: [],
			modified: [],
			deleted: [],
		});
	});

	it("ignores blank lines and parses multiple entries", () => {
		const output = ["A\ta.ts", "M\tb.ts", "D\tc.ts", ""].join("\n");
		expect(parseDiffNameStatus(output)).toEqual({
			new: ["a.ts"],
			modified: ["b.ts"],
			deleted: ["c.ts"],
		});
	});

	it("ignores a status with no path", () => {
		expect(parseDiffNameStatus("M")).toEqual({
			new: [],
			modified: [],
			deleted: [],
		});
	});

	it("returns empty groups for empty output", () => {
		expect(parseDiffNameStatus("")).toEqual({
			new: [],
			modified: [],
			deleted: [],
		});
	});

	it("counts a file committed then modified again once", () => {
		expect(parseDiffNameStatus("M\ttouched-twice.ts")).toEqual({
			new: [],
			modified: ["touched-twice.ts"],
			deleted: [],
		});
	});
});
