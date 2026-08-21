import type { AcceptanceCriterion } from "./splitAcceptanceCriteria";

export function normaliseDepths(
	items: AcceptanceCriterion[],
): AcceptanceCriterion[] {
	if (items.length === 0) return [{ text: "", depth: 0 }];
	let above = -1;
	return items.map((item) => {
		const depth = Math.min(Math.max(item.depth, 0), above + 1);
		above = depth;
		return item.depth === depth ? item : { ...item, depth };
	});
}
