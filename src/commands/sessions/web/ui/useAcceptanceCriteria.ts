import { useMemo } from "react";
import { splitAcceptanceCriteria } from "./splitAcceptanceCriteria";

export function useAcceptanceCriteria(body: string, editable: boolean) {
	return useMemo(
		() => (editable ? splitAcceptanceCriteria(body) : null),
		[body, editable],
	);
}
