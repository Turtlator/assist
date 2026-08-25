// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { watchCriteriaEditors } from "./watchCriteriaEditors";

const EDITOR =
	'<form><div role="toolbar"></div><textarea placeholder="Type your description here…"></textarea></form>';

function navigate(pathname: string): void {
	globalThis.history.pushState({}, "", pathname);
}

function toggles(): number {
	return document.querySelectorAll("[data-assist-criteria-toggle]").length;
}

const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => {
	document.body.innerHTML = "";
	navigate("/staff0rd/assist/issues/1");
});

afterEach(() => {
	document.body.innerHTML = "";
});

describe("watchCriteriaEditors", () => {
	it("attaches to an editor already on the page", () => {
		document.body.innerHTML = EDITOR;
		watchCriteriaEditors();
		expect(toggles()).toBe(1);
	});

	it("attaches to an editor rendered later", async () => {
		watchCriteriaEditors();
		document.body.innerHTML = EDITOR;
		await settled();
		expect(toggles()).toBe(1);
	});

	it("attaches on the new-issue form", async () => {
		navigate("/staff0rd/assist/issues/new");
		watchCriteriaEditors();
		document.body.innerHTML = EDITOR;
		await settled();
		expect(toggles()).toBe(1);
	});

	it("re-attaches after a client-side navigation to another issue", async () => {
		document.body.innerHTML = EDITOR;
		watchCriteriaEditors();
		navigate("/staff0rd/assist/issues/2");
		document.body.innerHTML = EDITOR;
		await settled();
		expect(toggles()).toBe(1);
	});

	it("keeps watching when the page swaps the body element", async () => {
		watchCriteriaEditors();
		document.documentElement.replaceChild(
			document.createElement("body"),
			document.body,
		);
		document.body.innerHTML = EDITOR;
		await settled();
		expect(toggles()).toBe(1);
	});

	it("stays off pages that hold no issue body", async () => {
		navigate("/staff0rd/assist/pull/2");
		watchCriteriaEditors();
		document.body.innerHTML = EDITOR;
		await settled();
		expect(toggles()).toBe(0);
	});
});
