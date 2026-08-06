import { describe, expect, it } from "vitest";
import { collectCsharpComments } from "./collectCsharpComments";

describe("collectCsharpComments", () => {
	it("skips a leading comment header block", () => {
		const content = [
			"// Copyright Acme.",
			"// Licensed under MIT.",
			"",
			"using System;",
		].join("\n");

		expect(collectCsharpComments(content)).toEqual([]);
	});

	it("reports a comment below the header block", () => {
		const content = ["// Copyright Acme.", "using System;", "// a note"].join(
			"\n",
		);

		expect(collectCsharpComments(content)).toEqual([
			{ line: 3, text: "// a note" },
		]);
	});

	it("skips a leading block-comment header", () => {
		const content = ["/*", " * Copyright Acme.", " */", "using System;"].join(
			"\n",
		);

		expect(collectCsharpComments(content)).toEqual([]);
	});

	it("reports every comment when the file starts with code", () => {
		const content = ["using System;", "// a note"].join("\n");

		expect(collectCsharpComments(content)).toEqual([
			{ line: 2, text: "// a note" },
		]);
	});
});
