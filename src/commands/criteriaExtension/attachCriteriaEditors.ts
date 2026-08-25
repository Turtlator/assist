import { attachCriteriaToggle } from "./attachCriteriaToggle";
import { isIssueBodyPath } from "./isIssueBodyPath";
import { isIssueBodyTextarea } from "./isIssueBodyTextarea";

export function attachCriteriaEditors(): void {
	if (!isIssueBodyPath(globalThis.location.pathname)) return;
	for (const textarea of document.querySelectorAll("textarea")) {
		if (isIssueBodyTextarea(textarea)) attachCriteriaToggle(textarea);
	}
}
