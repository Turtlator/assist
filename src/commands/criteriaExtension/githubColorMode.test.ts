// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { githubColorMode } from "./githubColorMode";

function root(attributes: Record<string, string> = {}): Element {
	const element = document.createElement("html");
	for (const [name, value] of Object.entries(attributes))
		element.setAttribute(name, value);
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
		expect(githubColorMode(root({ "data-color-mode": "dark" }))).toBe("dark");
	});

	it("reads an explicit light mode", () => {
		expect(githubColorMode(root({ "data-color-mode": "light" }))).toBe("light");
	});

	it("follows the OS preference on auto", () => {
		prefersDark(true);
		expect(githubColorMode(root({ "data-color-mode": "auto" }))).toBe("dark");
	});

	it("falls back to light when nothing is set", () => {
		prefersDark(false);
		expect(githubColorMode(root())).toBe("light");
	});

	it("follows a dark day theme chosen under light mode", () => {
		const element = root({
			"data-color-mode": "light",
			"data-light-theme": "dark_dimmed",
			"data-dark-theme": "dark",
		});
		expect(githubColorMode(element)).toBe("dark");
	});

	it("follows a light night theme chosen under dark mode", () => {
		const element = root({
			"data-color-mode": "dark",
			"data-light-theme": "light",
			"data-dark-theme": "light_high_contrast",
		});
		expect(githubColorMode(element)).toBe("light");
	});

	it("reads the dark theme name when auto resolves to dark", () => {
		prefersDark(true);
		const element = root({
			"data-color-mode": "auto",
			"data-light-theme": "light",
			"data-dark-theme": "dark_high_contrast",
		});
		expect(githubColorMode(element)).toBe("dark");
	});
});
