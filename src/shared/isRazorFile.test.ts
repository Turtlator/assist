import { describe, expect, it } from "vitest";
import { isRazorFile } from "./isRazorFile";

describe("isRazorFile", () => {
	it("accepts .razor and .cshtml", () => {
		expect(isRazorFile("src/Pages/Counter.razor")).toBe(true);
		expect(isRazorFile("Views/Home/Index.cshtml")).toBe(true);
	});

	it("rejects other files", () => {
		expect(isRazorFile("src/Program.cs")).toBe(false);
		expect(isRazorFile("src/a.ts")).toBe(false);
		expect(isRazorFile("Counter.razor.css")).toBe(false);
		expect(isRazorFile(undefined)).toBe(false);
	});
});
