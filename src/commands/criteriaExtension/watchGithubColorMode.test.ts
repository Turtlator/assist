// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { watchGithubColorMode } from "./watchGithubColorMode";

type MediaListener = () => void;

const listeners: MediaListener[] = [];

function stubMedia(matches: boolean): void {
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({
			matches,
			addEventListener: (_: string, listener: MediaListener) =>
				listeners.push(listener),
			removeEventListener: (_: string, listener: MediaListener) =>
				listeners.splice(listeners.indexOf(listener), 1),
		})),
	);
}

function flush(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

afterEach(() => {
	listeners.length = 0;
	vi.unstubAllGlobals();
});

describe("watchGithubColorMode", () => {
	it("reports a mode switch on the document element", async () => {
		const element = document.createElement("html");
		element.setAttribute("data-color-mode", "light");
		const onChange = vi.fn();
		const stop = watchGithubColorMode(element, onChange);

		element.setAttribute("data-color-mode", "dark");
		await flush();

		expect(onChange).toHaveBeenCalledWith("dark");
		stop();
	});

	it("reports a theme name switch that changes how the page paints", async () => {
		const element = document.createElement("html");
		element.setAttribute("data-color-mode", "light");
		element.setAttribute("data-light-theme", "light");
		const onChange = vi.fn();
		const stop = watchGithubColorMode(element, onChange);

		element.setAttribute("data-light-theme", "dark_dimmed");
		await flush();

		expect(onChange).toHaveBeenCalledWith("dark");
		stop();
	});

	it("stays quiet when an attribute changes without changing the mode", async () => {
		const element = document.createElement("html");
		element.setAttribute("data-color-mode", "dark");
		element.setAttribute("data-dark-theme", "dark");
		const onChange = vi.fn();
		const stop = watchGithubColorMode(element, onChange);

		element.setAttribute("data-dark-theme", "dark_high_contrast");
		await flush();

		expect(onChange).not.toHaveBeenCalled();
		stop();
	});

	it("reports an OS preference flip under auto", () => {
		stubMedia(false);
		const element = document.createElement("html");
		element.setAttribute("data-color-mode", "auto");
		const onChange = vi.fn();
		const stop = watchGithubColorMode(element, onChange);

		stubMedia(true);
		for (const listener of listeners) listener();

		expect(onChange).toHaveBeenCalledWith("dark");
		stop();
	});

	it("stops listening once the watch is released", () => {
		stubMedia(false);
		const element = document.createElement("html");
		const stop = watchGithubColorMode(element, vi.fn());

		stop();

		expect(listeners).toHaveLength(0);
	});
});
