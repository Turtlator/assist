import { attachCriteriaEditors } from "./attachCriteriaEditors";

export function watchCriteriaEditors(): void {
	attachCriteriaEditors();
	new MutationObserver(attachCriteriaEditors).observe(
		document.documentElement,
		{
			childList: true,
			subtree: true,
		},
	);
}
