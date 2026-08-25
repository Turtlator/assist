import { attachCriteriaToggle } from "./attachCriteriaToggle";
import { isIssueBodyPath } from "./isIssueBodyPath";
import { isIssueBodyTextarea } from "./isIssueBodyTextarea";

function attachAll(): void {
	if (!isIssueBodyPath(globalThis.location.pathname)) return;
	for (const textarea of document.querySelectorAll("textarea")) {
		if (isIssueBodyTextarea(textarea)) attachCriteriaToggle(textarea);
	}
}

/**
 * GitHub only renders the body textarea once Edit is pressed, so watch the
 * document rather than scanning once at load.
 */
export function criteriaContentScript(): void {
	attachAll();
	new MutationObserver(attachAll).observe(document.body, {
		childList: true,
		subtree: true,
	});
}

criteriaContentScript();
