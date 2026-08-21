import type {
	CriterionKeyAction,
	CriterionKeyEvent,
} from "./CriterionKeyEvent";
import { criterionArrowFocus } from "./criterionArrowFocus";
import { criterionEditKey } from "./criterionEditKey";
import type { AcceptanceCriterion } from "./splitAcceptanceCriteria";

export function criterionKeyAction(
	items: AcceptanceCriterion[],
	index: number,
	event: CriterionKeyEvent,
): CriterionKeyAction | null {
	return (
		criterionEditKey(items, index, event) ??
		criterionArrowFocus(items, index, event)
	);
}
