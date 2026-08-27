// @vitest-environment jsdom
import { act, fireEvent } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { mountCriteriaOutline } from "./mountCriteriaOutline";

const ROW_HEIGHT = 20;

const BODY = [
	"## Acceptance criteria",
	"",
	"1. a",
	"   1. a1",
	"1. b",
	"1. c",
].join("\n");

beforeAll(() => {
	Element.prototype.setPointerCapture ??= () => {};
	Element.prototype.releasePointerCapture ??= () => {};
});

const mounted: (() => void)[] = [];

afterEach(() => {
	for (const unmount of mounted.splice(0)) unmount();
	vi.unstubAllGlobals();
});

function stubBox(element: Element, top: number, height: number): void {
	element.getBoundingClientRect = () =>
		({ top, height, bottom: top + height, left: 0 }) as DOMRect;
}

function open(body = BODY) {
	const host = document.createElement("div");
	document.body.append(host);
	const onBody = vi.fn();
	let root!: ReturnType<typeof mountCriteriaOutline>;
	act(() => {
		root = mountCriteriaOutline(host, body, onBody);
	});
	mounted.push(() => {
		act(() => root.unmount());
		host.remove();
	});
	const shadow = host.shadowRoot as ShadowRoot;
	const list = shadow.querySelector('[aria-label="Acceptance criteria"]');
	if (!list) throw new Error("no outline in the shadow root");
	stubBox(list, 0, 0);
	const rows = shadow.querySelectorAll("[data-criterion-row]");
	rows.forEach((row, index) => stubBox(row, index * ROW_HEIGHT, ROW_HEIGHT));
	return { shadow, onBody };
}

function dragGrip(
	shadow: ShadowRoot,
	number: string,
	to: { clientX: number; clientY: number },
): void {
	const grip = shadow.querySelector(
		`[aria-label="Reorder criterion ${number}"]`,
	);
	if (!grip) throw new Error(`no grip for criterion ${number}`);
	act(() => {
		fireEvent.pointerDown(grip, { clientX: 0, clientY: 0, button: 0 });
		fireEvent.pointerMove(grip, to);
		fireEvent.pointerUp(grip, to);
	});
}

describe("mountCriteriaOutline drag", () => {
	it("measures rows through the shadow root to pick the insertion point", () => {
		const { shadow, onBody } = open();

		dragGrip(shadow, "2", { clientX: 0, clientY: 5 });

		expect(onBody).toHaveBeenCalledWith(
			["## Acceptance criteria", "", "1. b", "1. a", "   1. a1", "1. c"].join(
				"\n",
			),
		);
	});

	it("carries a criterion's children to the dropped depth", () => {
		const { shadow, onBody } = open();

		dragGrip(shadow, "1", { clientX: 22, clientY: 65 });

		expect(onBody).toHaveBeenCalledWith(
			[
				"## Acceptance criteria",
				"",
				"1. b",
				"   1. a",
				"      1. a1",
				"1. c",
			].join("\n"),
		);
	});
});
