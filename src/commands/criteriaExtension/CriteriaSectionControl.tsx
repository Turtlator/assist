import { AcceptanceCriteriaOutline } from "../sessions/web/ui/AcceptanceCriteriaOutline";
import { convertAcceptanceCriteria } from "../sessions/web/ui/convertAcceptanceCriteria";
import { CriteriaSectionButton } from "../sessions/web/ui/CriteriaSectionButton";
import type { AcceptanceCriterion } from "../sessions/web/ui/splitAcceptanceCriteria";
import { writeAcceptanceCriteria } from "../sessions/web/ui/writeAcceptanceCriteria";

export function CriteriaSectionControl({
	items,
	body,
	onBody,
}: {
	items: AcceptanceCriterion[] | null;
	body: string;
	onBody: (body: string) => void;
}) {
	if (!items)
		return (
			<CriteriaSectionButton
				kind="convert"
				onClick={() => onBody(convertAcceptanceCriteria(body))}
			/>
		);
	return (
		<AcceptanceCriteriaOutline
			items={items}
			onChange={(next) => onBody(writeAcceptanceCriteria(body, next))}
		/>
	);
}
