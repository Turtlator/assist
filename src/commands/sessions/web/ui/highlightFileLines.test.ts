import { describe, expect, it } from "vitest";
import { highlightFileLines } from "./highlightFileLines";

function text(line: { text: string }[]): string {
	return line.map((token) => token.text).join("");
}

describe("highlightFileLines", () => {
	it("splits highlighted tokens into lines without the trailing blank", () => {
		const lines = highlightFileLines("const a = 1;\nlet b = 2;\n", "src/a.ts");

		expect(lines).toHaveLength(2);
		expect(text(lines[0] ?? [])).toBe("const a = 1;");
		expect(text(lines[1] ?? [])).toBe("let b = 2;");
	});

	it("classifies tokens for a known language", () => {
		const lines = highlightFileLines("const a = 1;", "src/a.ts");

		expect(lines[0]?.[0]).toEqual({
			text: "const",
			className: "token keyword",
		});
		expect(lines[0]?.some((token) => token.className === "token number")).toBe(
			true,
		);
	});

	it("keeps blank interior lines", () => {
		const lines = highlightFileLines("a\n\nb\n", "notes.txt");

		expect(lines).toHaveLength(3);
		expect(lines[1]).toEqual([]);
	});

	it("returns unhighlighted lines for an unknown extension", () => {
		const lines = highlightFileLines("plain text\nsecond", "notes.unknownext");

		expect(lines).toEqual([
			[{ text: "plain text", className: undefined }],
			[{ text: "second", className: undefined }],
		]);
	});

	it("skips highlighting for very large files", () => {
		const content = `const a = 1;\n${"x".repeat(400_000)}`;
		const lines = highlightFileLines(content, "src/a.ts");

		expect(lines[0]).toEqual([{ text: "const a = 1;", className: undefined }]);
	});
});
