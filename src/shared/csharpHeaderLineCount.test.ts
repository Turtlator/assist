import { describe, expect, it } from "vitest";
import { csharpHeaderLineCount } from "./csharpHeaderLineCount";

describe("csharpHeaderLineCount", () => {
	it("counts a leading line-comment header", () => {
		const content = [
			"// Copyright Acme.",
			"// Licensed.",
			"",
			"var a = 1;",
		].join("\n");

		expect(csharpHeaderLineCount(content)).toBe(3);
	});

	it("counts a leading block-comment header", () => {
		const content = [
			"/*",
			" * Copyright Acme.",
			" */",
			"var a = 1;",
			"// below",
		].join("\n");

		expect(csharpHeaderLineCount(content)).toBe(3);
	});

	it("counts a single-line block-comment header", () => {
		const content = ["/* Copyright Acme. */", "var a = 1;"].join("\n");

		expect(csharpHeaderLineCount(content)).toBe(1);
	});

	it("returns zero when the file starts with code", () => {
		const content = ["using System;", "// a note"].join("\n");

		expect(csharpHeaderLineCount(content)).toBe(0);
	});

	it("stops at the first code line", () => {
		const content = ["// header", "using System;", "// a note"].join("\n");

		expect(csharpHeaderLineCount(content)).toBe(1);
	});

	it("counts every line of a comment-only file", () => {
		const content = ["// one", "// two"].join("\n");

		expect(csharpHeaderLineCount(content)).toBe(2);
	});
});
