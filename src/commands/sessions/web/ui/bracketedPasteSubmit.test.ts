import { describe, expect, it } from "vitest";
import { bracketedPasteSubmit } from "./bracketedPasteSubmit";

const ESC = String.fromCharCode(27);

describe("bracketedPasteSubmit", () => {
	it("brackets the text and appends a carriage return", () => {
		expect(bracketedPasteSubmit("hello")).toBe(`${ESC}[200~hello${ESC}[201~\r`);
	});

	it("normalises newlines to carriage returns inside the paste", () => {
		expect(bracketedPasteSubmit("a\nb\r\nc")).toBe(
			`${ESC}[200~a\rb\rc${ESC}[201~\r`,
		);
	});
});
