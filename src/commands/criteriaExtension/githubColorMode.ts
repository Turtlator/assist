/**
 * GitHub stamps `data-color-mode` on the document element, with the resolved
 * theme names in `data-light-theme` / `data-dark-theme`. Only the light/dark
 * split matters here; `auto` defers to the OS preference.
 */
export function githubColorMode(root: Element): "light" | "dark" {
	const mode = root.getAttribute("data-color-mode");
	if (mode === "light") return "light";
	if (mode === "dark") return "dark";
	return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}
