/**
 * GitHub stamps `data-color-mode` on the document element, with the resolved
 * theme names in `data-light-theme` / `data-dark-theme`. The named theme decides
 * how the page paints — a day theme of `dark_dimmed` renders dark under
 * `data-color-mode="light"` — so the mode only picks which name to read, and
 * `auto` defers to the OS preference.
 */
export type GithubColorMode = "light" | "dark";

function preferredMode(root: Element): GithubColorMode {
	const mode = root.getAttribute("data-color-mode");
	if (mode === "light" || mode === "dark") return mode;
	return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export function githubColorMode(root: Element): GithubColorMode {
	const preferred = preferredMode(root);
	const theme = root.getAttribute(
		preferred === "dark" ? "data-dark-theme" : "data-light-theme",
	);
	if (!theme) return preferred;
	return theme.startsWith("dark") ? "dark" : "light";
}
