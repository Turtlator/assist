import { describe, expect, it } from "vitest";
import { extractRazorComments } from "./extractRazorComments";

function texts(content: string): string[] {
	return extractRazorComments(content).map((comment) => comment.text);
}

describe("extractRazorComments", () => {
	it("finds a razor comment", () => {
		expect(texts("<p>hi</p>\n@* note *@")).toEqual(["@* note *@"]);
	});

	it("finds a razor comment spanning multiple lines", () => {
		expect(texts("@*\n note\n more\n*@\n<p>hi</p>")).toEqual([
			"@*\n note\n more\n*@",
		]);
	});

	it("reports the line a multi-line razor comment starts on", () => {
		expect(extractRazorComments("<p>hi</p>\n@*\n note\n*@")).toEqual([
			{ line: 2, text: "@*\n note\n*@" },
		]);
	});

	it("finds an html comment", () => {
		expect(texts("<div>\n<!-- note -->\n</div>")).toEqual(["<!-- note -->"]);
	});

	it("finds an html comment spanning multiple lines", () => {
		expect(extractRazorComments("<div>\n<!--\n note\n-->\n</div>")).toEqual([
			{ line: 2, text: "<!--\n note\n-->" },
		]);
	});

	it("returns nothing for markup without comments", () => {
		const content = [
			'@page "/counter"',
			"<h1>Counter</h1>",
			'<p role="status">Current count: @currentCount</p>',
			'<button class="btn" @onclick="Increment">Click me</button>',
		].join("\n");

		expect(texts(content)).toEqual([]);
	});

	it("ignores an html comment inside an attribute value", () => {
		expect(texts('<div title="<!-- not a comment -->">x</div>')).toEqual([]);
	});

	it("ignores a razor comment marker inside an attribute value", () => {
		expect(texts('<div title="@* not a comment *@">x</div>')).toEqual([]);
	});

	it("ignores an html comment marker inside a csharp string in a code block", () => {
		expect(texts('@{\n\tvar s = "<!-- not a comment -->";\n}')).toEqual([]);
	});

	it("ignores a razor comment marker inside a csharp string in a code block", () => {
		expect(texts('@{\n\tvar s = "@* not a comment *@";\n}')).toEqual([]);
	});

	it("ignores comment markers inside a verbatim string in a code block", () => {
		expect(texts(String.raw`@{ var p = @"C:\a <!-- b -->"; }`)).toEqual([]);
	});

	it("ignores comment markers inside a csharp string in a code member block", () => {
		const content = [
			"@code {",
			'\tprivate string Marker = "<!-- not a comment -->";',
			"}",
		].join("\n");

		expect(texts(content)).toEqual([]);
	});

	it("finds a razor comment inside a code block", () => {
		expect(texts("@{\n\t@* note *@\n\tvar a = 1;\n}")).toEqual(["@* note *@"]);
	});

	it("finds a comment in markup after a code block closes", () => {
		expect(texts('@{ var s = "x"; }\n<!-- note -->')).toEqual([
			"<!-- note -->",
		]);
	});

	it("does not treat an escaped at-sign as a razor comment", () => {
		expect(texts("<p>@@* not a comment *@</p>")).toEqual([]);
	});

	it("ignores comment markers inside an inline expression argument", () => {
		expect(texts('<p>@Html.Raw("<!-- x -->")</p>')).toEqual([]);
	});

	it("ignores a razor comment marker inside an inline expression argument", () => {
		expect(texts('<p>@Html.Raw("@* x *@")</p>')).toEqual([]);
	});

	it("ignores comment markers inside an explicit expression", () => {
		expect(texts('<p>@("<!-- x -->")</p>')).toEqual([]);
	});

	it("ignores comment markers inside an indexer expression", () => {
		expect(texts('<p>@ViewData["<!-- x -->"]</p>')).toEqual([]);
	});

	it("finds a comment after an inline expression", () => {
		expect(texts("<p>@Model.Name</p>\n<!-- note -->")).toEqual([
			"<!-- note -->",
		]);
	});

	it("finds a comment inside a conditional body", () => {
		expect(texts("@if (a)\n{\n\t<!-- note -->\n}")).toEqual(["<!-- note -->"]);
	});

	it("finds a comment inside a conditional body written without a space", () => {
		expect(texts("@if(a)\n{\n\t<!-- note -->\n}")).toEqual(["<!-- note -->"]);
	});

	it("finds a comment inside a section body", () => {
		expect(texts("@section Scripts {\n\t<!-- note -->\n}")).toEqual([
			"<!-- note -->",
		]);
	});

	it("still finds comments when an expression group is never closed", () => {
		expect(texts("<p>@Html.Raw(</p>\n<!-- note -->")).toEqual([
			"<!-- note -->",
		]);
	});

	it("ignores comment markers inside a script body", () => {
		expect(texts('<script>var s = "<!-- x -->";</script>')).toEqual([]);
	});

	it("ignores comment markers inside a style body", () => {
		expect(texts('<style>.a { content: "@* x *@"; }</style>')).toEqual([]);
	});

	it("finds a comment after a script body closes", () => {
		expect(texts("<script>var a = 1;</script>\n<!-- note -->")).toEqual([
			"<!-- note -->",
		]);
	});

	it("finds a comment after a self-closing tag named like a script", () => {
		expect(texts("<script-host />\n<!-- note -->")).toEqual(["<!-- note -->"]);
	});

	it("still finds comments when a script tag is never closed", () => {
		expect(texts("<script>\n<!-- note -->")).toEqual(["<!-- note -->"]);
	});

	it("ignores an apostrophe in markup text inside a code block", () => {
		expect(texts("@{\n\t<p>it's fine</p>\n}\n<!-- note -->")).toEqual([
			"<!-- note -->",
		]);
	});
});
