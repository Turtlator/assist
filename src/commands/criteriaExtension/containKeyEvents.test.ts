// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { containKeyEvents } from "./containKeyEvents";

function shadowedField() {
	const host = document.createElement("div");
	document.body.append(host);
	const field = document.createElement("textarea");
	host.attachShadow({ mode: "open" }).append(field);
	return { host, field };
}

afterEach(() => {
	document.body.innerHTML = "";
});

describe("containKeyEvents", () => {
	it("stops a keystroke reaching document-level handlers", () => {
		const { host, field } = shadowedField();
		const onDocument = vi.fn();
		document.addEventListener("keydown", onDocument);
		containKeyEvents(host);
		field.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "s" }),
		);
		document.removeEventListener("keydown", onDocument);
		expect(onDocument).not.toHaveBeenCalled();
	});

	it("still lets handlers inside the shadow root run", () => {
		const { host, field } = shadowedField();
		const onField = vi.fn();
		field.addEventListener("keydown", onField);
		containKeyEvents(host);
		field.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, composed: true, key: "s" }),
		);
		expect(onField).toHaveBeenCalled();
	});

	it("contains keyup as well as keydown", () => {
		const { host, field } = shadowedField();
		const onDocument = vi.fn();
		document.addEventListener("keyup", onDocument);
		containKeyEvents(host);
		field.dispatchEvent(
			new KeyboardEvent("keyup", { bubbles: true, composed: true, key: "s" }),
		);
		document.removeEventListener("keyup", onDocument);
		expect(onDocument).not.toHaveBeenCalled();
	});
});
