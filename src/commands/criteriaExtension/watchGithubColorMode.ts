import { type GithubColorMode, githubColorMode } from "./githubColorMode";

const THEME_ATTRIBUTES = [
	"data-color-mode",
	"data-light-theme",
	"data-dark-theme",
];

export function watchGithubColorMode(
	root: Element,
	onChange: (mode: GithubColorMode) => void,
): () => void {
	let current = githubColorMode(root);
	const settle = () => {
		const next = githubColorMode(root);
		if (next === current) return;
		current = next;
		onChange(next);
	};
	const observer = new MutationObserver(settle);
	observer.observe(root, { attributeFilter: THEME_ATTRIBUTES });
	const media = globalThis.matchMedia?.("(prefers-color-scheme: dark)");
	media?.addEventListener?.("change", settle);
	return () => {
		observer.disconnect();
		media?.removeEventListener?.("change", settle);
	};
}
