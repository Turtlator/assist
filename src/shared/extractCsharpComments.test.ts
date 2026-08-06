import { describe, expect, it } from "vitest";
import { extractCsharpComments } from "./extractCsharpComments";

function texts(content: string): string[] {
	return extractCsharpComments(content).map((comment) => comment.text);
}

describe("extractCsharpComments", () => {
	it("finds a line comment", () => {
		expect(texts("var a = 1; // note")).toEqual(["// note"]);
	});

	it("finds an xml doc comment", () => {
		expect(
			texts("/// <summary>Does a thing.</summary>\nvoid Run() { }"),
		).toEqual(["/// <summary>Does a thing.</summary>"]);
	});

	it("finds a block comment spanning lines", () => {
		expect(texts("/*\n note\n*/\nvar a = 1;")).toEqual(["/*\n note\n*/"]);
	});

	it("reports the line each comment starts on", () => {
		expect(extractCsharpComments("var a = 1;\nvar b = 2; // two\n")).toEqual([
			{ line: 2, text: "// two" },
		]);
	});

	it("returns nothing for code without comments", () => {
		expect(texts("var a = 1;\nvar b = 2;")).toEqual([]);
	});

	it("ignores // inside a regular string", () => {
		expect(texts('var url = "https://example.com";')).toEqual([]);
	});

	it("ignores // inside a verbatim string", () => {
		expect(texts(String.raw`var path = @"C:\a // b";`)).toEqual([]);
	});

	it("treats a doubled quote in a verbatim string as an escape", () => {
		expect(texts('var s = @"he said ""hi"" // not a comment";')).toEqual([]);
	});

	it("does not treat a trailing backslash in a verbatim string as an escape", () => {
		expect(texts('var dir = @"C:\\temp\\";\nvar b = 2;')).toEqual([]);
	});

	it("ignores // inside a raw string", () => {
		expect(texts('var s = """raw // text""";')).toEqual([]);
	});

	it("ignores // inside a multi-line raw string", () => {
		expect(texts('var s = """\n// not a comment\n""";')).toEqual([]);
	});

	it("ignores // inside an interpolated string", () => {
		expect(texts('var s = $"{x} // y";')).toEqual([]);
	});

	it("ignores // after an interpolation hole containing a string", () => {
		expect(texts('var s = $"{map["k"]} // y";')).toEqual([]);
	});

	it("ignores /* inside a string", () => {
		expect(texts('var s = "/* not a comment */";')).toEqual([]);
	});

	it("ignores a slash char literal", () => {
		expect(texts("var c = '/';\nvar d = 2;")).toEqual([]);
	});

	it("ignores an escaped quote char literal", () => {
		expect(texts("var c = '\\'';\nvar d = \"a\";")).toEqual([]);
	});

	it("does not report preprocessor directives", () => {
		expect(
			texts("#region Helpers\n#pragma warning disable\n#nullable enable"),
		).toEqual([]);
	});

	it("still finds comments after a directive with an apostrophe", () => {
		expect(texts("#region It's fine\nvar a = 1; // note")).toEqual(["// note"]);
	});

	it("finds a comment after a verbatim string on the same line", () => {
		expect(texts(String.raw`var p = @"C:\a"; // note`)).toEqual(["// note"]);
	});

	it("finds multiple comments", () => {
		expect(texts("a(); // one\nb(); /* two */")).toEqual([
			"// one",
			"/* two */",
		]);
	});
});
