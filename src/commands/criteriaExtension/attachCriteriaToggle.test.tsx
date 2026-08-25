// @vitest-environment jsdom
import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { attachCriteriaToggle } from "./attachCriteriaToggle";

const BODY = [
	"Intro",
	"",
	"## Acceptance Criteria",
	"",
	"1. one",
	"   1. nested",
	"",
	"## Notes",
	"keep",
].join("\n");

function setup(body: string) {
	document.body.innerHTML =
		'<form><div role="toolbar"></div><textarea name="issue[body]"></textarea></form>';
	const field = document.querySelector("textarea") as HTMLTextAreaElement;
	field.value = body;
	attachCriteriaToggle(field);
	const button = document.querySelector("[aria-pressed]") as HTMLButtonElement;
	return { field, button };
}

function rows(field: HTMLTextAreaElement) {
	const host = field.nextElementSibling as HTMLElement;
	return Array.from(
		host.shadowRoot?.querySelectorAll("[data-criterion-row]") ?? [],
	);
}

describe("attachCriteriaToggle", () => {
	it("adds the toggle to the editor toolbar", () => {
		const { button } = setup(BODY);
		expect(button.textContent).toBe("Outline criteria");
		expect(button.parentElement?.getAttribute("role")).toBe("toolbar");
	});

	it("hides the textarea and renders a row per criterion", async () => {
		const { field, button } = setup(BODY);
		await act(async () => button.click());
		expect(field.style.display).toBe("none");
		expect(rows(field)).toHaveLength(2);
	});

	it("restores the textarea unchanged when toggled off", async () => {
		const { field, button } = setup(BODY);
		await act(async () => button.click());
		await act(async () => button.click());
		expect(field.style.display).toBe("");
		expect(field.nextElementSibling).toBe(null);
		expect(field.value).toBe(BODY);
	});

	it("attaches only once per textarea", () => {
		const { field } = setup(BODY);
		attachCriteriaToggle(field);
		expect(document.querySelectorAll("[aria-pressed]")).toHaveLength(1);
	});
});
