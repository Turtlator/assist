// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { githubColorMode } from "./githubColorMode";

function root(mode?: string): Element {
	const element = document.createElement("html");
	if (mode) element.setAttribute("data-color-mode", mode);
	return element;
}

function prefersDark(matches: boolean): void {
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({ matches })),
	);
}

afterEach(() => vi.unstubAllGlobals());

describe("githubColorMode", () => {
	it("reads an explicit dark mode", () => {
		expect(githubColorMode(root("dark"))).toBe("dark");
	});

	it("reads an explicit light mode", () => {
		expect(githubColorMode(root("light"))).toBe("light");
	});

	it("follows the OS preference on auto", () => {
		prefersDark(true);
		expect(githubColorMode(root("auto"))).toBe("dark");
	});

	it("falls back to light when nothing is set", () => {
		prefersDark(false);
		expect(githubColorMode(root())).toBe("light");
	});
});
