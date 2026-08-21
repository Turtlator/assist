import { useState } from "react";
import { wrapCollapsed } from "./wrapCollapsed";

export function useEditableBody(initialBody: string, editable: boolean) {
	const [body, setBody] = useState(initialBody);

	return {
		body,
		collapse: (quote: string) =>
			setBody((current) => wrapCollapsed(current, quote)),
		editedBody: () => (editable ? body : undefined),
	};
}
