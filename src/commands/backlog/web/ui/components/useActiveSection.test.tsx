// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useActiveSection } from "./useActiveSection";

type ObserverStub = {
	root: Element | null;
	fire: () => void;
	observed: Element[];
};

function stubIntersectionObserver(): ObserverStub {
	const stub: ObserverStub = { root: null, fire: () => {}, observed: [] };
	class FakeObserver {
		constructor(callback: () => void, options: { root?: Element | null }) {
			stub.root = options.root ?? null;
			stub.fire = callback;
		}
		observe(el: Element) {
			stub.observed.push(el);
		}
		disconnect() {}
	}
	vi.stubGlobal("IntersectionObserver", FakeObserver);
	return stub;
}

function setTop(el: HTMLElement, top: number) {
	el.getBoundingClientRect = () => ({ top }) as DOMRect;
}

function buildSections(tops: Record<string, number>) {
	const container = document.createElement("div");
	container.style.overflowY = "auto";
	setTop(container, 0);
	document.body.append(container);
	for (const [id, top] of Object.entries(tops)) {
		const section = document.createElement("div");
		section.id = id;
		setTop(section, top);
		container.append(section);
	}
	return container;
}

afterEach(() => {
	vi.unstubAllGlobals();
	document.body.replaceChildren();
});

describe("useActiveSection", () => {
	it("observes every section, rooted on the scroll container", () => {
		const stub = stubIntersectionObserver();
		const container = buildSections({ one: -400, two: 300 });

		renderHook(() => useActiveSection(["one", "two"]));

		expect(stub.root).toBe(container);
		expect(stub.observed.map((el) => el.id)).toEqual(["one", "two"]);
	});

	it("activates the last section scrolled past the sticky header", () => {
		const stub = stubIntersectionObserver();
		buildSections({ one: -400, two: 100, three: 600 });

		const { result } = renderHook(() =>
			useActiveSection(["one", "two", "three"]),
		);
		act(() => stub.fire());

		expect(result.current).toBe("two");
	});

	it("keeps the first section active while nothing has scrolled past", () => {
		const stub = stubIntersectionObserver();
		buildSections({ one: 300, two: 800 });

		const { result } = renderHook(() => useActiveSection(["one", "two"]));
		act(() => stub.fire());

		expect(result.current).toBe("one");
	});

	it("re-evaluates on scroll, without an intersection change", () => {
		stubIntersectionObserver();
		const container = buildSections({ one: -400, two: 300 });
		const [, two] = [...container.children] as HTMLElement[];

		const { result } = renderHook(() => useActiveSection(["one", "two"]));
		expect(result.current).toBe("one");

		setTop(two, 50);
		act(() => container.dispatchEvent(new Event("scroll")));

		expect(result.current).toBe("two");
	});

	it("tracks a phase anchor overtaking its plan section", () => {
		const stub = stubIntersectionObserver();
		const container = buildSections({});
		for (const [id, top] of [
			["item-section-plan", -900],
			["item-phase-0", -300],
			["item-phase-1", 40],
			["item-phase-2", 700],
		] as const) {
			const el = document.createElement("div");
			el.id = id;
			setTop(el, top);
			container.append(el);
		}

		const { result } = renderHook(() =>
			useActiveSection([
				"item-section-plan",
				"item-phase-0",
				"item-phase-1",
				"item-phase-2",
			]),
		);
		act(() => stub.fire());

		expect(result.current).toBe("item-phase-1");
	});
});
