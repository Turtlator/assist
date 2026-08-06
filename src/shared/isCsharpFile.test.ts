import { describe, expect, it } from "vitest";
import { isCsharpFile } from "./isCsharpFile";

describe("isCsharpFile", () => {
	it("accepts .cs and .csx", () => {
		expect(isCsharpFile("src/Program.cs")).toBe(true);
		expect(isCsharpFile("build.csx")).toBe(true);
	});

	it("rejects other files", () => {
		expect(isCsharpFile("src/a.ts")).toBe(false);
		expect(isCsharpFile("Program.csproj")).toBe(false);
		expect(isCsharpFile("Page.cshtml")).toBe(false);
		expect(isCsharpFile(undefined)).toBe(false);
	});
});
