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

async function setup(body: string) {
	document.body.innerHTML =
		'<form><div role="toolbar"></div><textarea placeholder="Type your description here…"></textarea></form>';
	const field = document.querySelector("textarea") as HTMLTextAreaElement;
	field.value = body;
	await act(async () => attachCriteriaToggle(field));
	const button = document.querySelector(
		"[data-assist-criteria-toggle]",
	) as HTMLButtonElement;
	return { field, button };
}

function shadow(field: HTMLTextAreaElement): ShadowRoot | null {
	return (field.nextElementSibling as HTMLElement | null)?.shadowRoot ?? null;
}

function rows(field: HTMLTextAreaElement) {
	return Array.from(
		shadow(field)?.querySelectorAll("[data-criterion-row]") ?? [],
	);
}

function shadowHosts(): number {
	return Array.from(document.querySelectorAll("div")).filter(
		(element) => element.shadowRoot,
	).length;
}

describe("attachCriteriaToggle", () => {
	it("adds the toggle to the editor toolbar", async () => {
		const { button } = await setup(BODY);
		expect(button.parentElement?.getAttribute("role")).toBe("toolbar");
	});

	it("opens the outline without a press when the body has criteria", async () => {
		const { field, button } = await setup(BODY);
		expect(field.style.display).toBe("none");
		expect(rows(field)).toHaveLength(2);
		expect(button.textContent).toBe("Edit markdown");
	});

	it("stretches the mounted host to the editor width", async () => {
		const { field } = await setup(BODY);
		expect((field.nextElementSibling as HTMLElement).style.width).toBe("100%");
	});

	it("keeps the markdown either side of the section editable", async () => {
		const { field } = await setup(BODY);
		const before = shadow(field)?.querySelector<HTMLTextAreaElement>(
			'[aria-label="Body before acceptance criteria"]',
		);
		const after = shadow(field)?.querySelector<HTMLTextAreaElement>(
			'[aria-label="Body after acceptance criteria"]',
		);
		expect(before?.value).toBe("Intro\n\n## Acceptance Criteria\n");
		expect(after?.value).toBe("\n## Notes\nkeep");
		expect(before?.readOnly).toBe(false);
		expect(after?.readOnly).toBe(false);
	});

	it("leaves the textarea alone when the body has no criteria", async () => {
		const { field, button } = await setup("Just prose");
		expect(field.style.display).toBe("");
		expect(button.textContent).toBe("Outline criteria");
	});

	it("restores the textarea unchanged when toggled off", async () => {
		const { field, button } = await setup(BODY);
		await act(async () => button.click());
		expect(field.style.display).toBe("");
		expect(field.nextElementSibling).toBe(null);
		expect(field.value).toBe(BODY);
	});

	it("opens once the value arrives late", async () => {
		const { field } = await setup("");
		field.value = BODY;
		await act(async () => field.dispatchEvent(new Event("input")));
		expect(rows(field)).toHaveLength(2);
	});

	it("offers the insert button when the toggle is pressed on a bare body", async () => {
		const { field, button } = await setup("Just prose");
		await act(async () => button.click());
		expect(shadow(field)?.querySelector("button")?.textContent).toBe(
			"Add acceptance criteria",
		);
	});

	it("mounts one outline when insert rewrites the body", async () => {
		const { field, button } = await setup("Just prose");
		await act(async () => button.click());
		const insert = shadow(field)?.querySelector("button") as HTMLButtonElement;
		await act(async () => insert.click());
		expect(shadowHosts()).toBe(1);
		expect(rows(field)).toHaveLength(1);
	});

	it("attaches only once per textarea", async () => {
		const { field } = await setup(BODY);
		attachCriteriaToggle(field);
		expect(
			document.querySelectorAll("[data-assist-criteria-toggle]"),
		).toHaveLength(1);
	});
});
