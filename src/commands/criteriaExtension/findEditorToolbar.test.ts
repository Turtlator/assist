// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { findEditorToolbar } from "./findEditorToolbar";

function editor(markup: string): HTMLTextAreaElement {
	document.body.innerHTML = markup;
	return document.querySelector("textarea") as HTMLTextAreaElement;
}

describe("findEditorToolbar", () => {
	it("finds a toolbar in a sibling subtree", () => {
		const field = editor(
			'<form><div><div role="toolbar" id="bar"></div></div><textarea></textarea></form>',
		);
		expect(findEditorToolbar(field)?.id).toBe("bar");
	});

	it("finds a markdown-toolbar element", () => {
		const field = editor(
			'<div><markdown-toolbar id="bar"></markdown-toolbar><textarea></textarea></div>',
		);
		expect(findEditorToolbar(field)?.id).toBe("bar");
	});

	it("returns null when the form holds no toolbar", () => {
		const field = editor(
			'<div role="toolbar"></div><form><textarea></textarea></form>',
		);
		expect(findEditorToolbar(field)).toBe(null);
	});
});
