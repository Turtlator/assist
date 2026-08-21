import { useState } from "react";
import type { AcceptanceCriterion } from "./splitAcceptanceCriteria";
import { useAcceptanceCriteria } from "./useAcceptanceCriteria";
import { wrapCollapsed } from "./wrapCollapsed";
import { writeAcceptanceCriteria } from "./writeAcceptanceCriteria";

export function useEditableBody(initialBody: string, editable: boolean) {
	const [body, setBody] = useState(initialBody);
	const criteria = useAcceptanceCriteria(body, editable);

	return {
		body,
		criteria,
		collapse: (quote: string) =>
			setBody((current) => wrapCollapsed(current, quote)),
		writeCriteria: (items: AcceptanceCriterion[]) =>
			setBody((current) => writeAcceptanceCriteria(current, items)),
		editedBody: () => (editable ? body : undefined),
	};
}
