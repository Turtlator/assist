import { watchCriteriaEditors } from "./watchCriteriaEditors";

export function criteriaContentScript(): void {
	watchCriteriaEditors();
}

criteriaContentScript();
