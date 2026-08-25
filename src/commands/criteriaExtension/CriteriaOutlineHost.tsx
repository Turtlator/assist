import { useState } from "react";
import { acceptanceCriteriaState } from "../sessions/web/ui/acceptanceCriteriaState";
import { AcceptanceCriteriaOutline } from "../sessions/web/ui/AcceptanceCriteriaOutline";
import type { AcceptanceCriterion } from "../sessions/web/ui/splitAcceptanceCriteria";
import { writeAcceptanceCriteria } from "../sessions/web/ui/writeAcceptanceCriteria";

export function CriteriaOutlineHost({
	initialBody,
	onBody,
}: {
	initialBody: string;
	onBody: (body: string) => void;
}) {
	const [body, setBody] = useState(initialBody);
	const criteria = acceptanceCriteriaState(body);

	const write = (items: AcceptanceCriterion[]) => {
		const next = writeAcceptanceCriteria(body, items);
		setBody(next);
		onBody(next);
	};

	if (criteria.kind !== "outline") return null;
	return <AcceptanceCriteriaOutline items={criteria.items} onChange={write} />;
}
