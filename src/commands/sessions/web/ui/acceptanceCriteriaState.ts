import { acceptanceSectionSlice } from "./acceptanceSectionSlice";
import {
	type AcceptanceCriterion,
	splitAcceptanceCriteria,
} from "./splitAcceptanceCriteria";

type AcceptanceCriteriaState = { before: string; after: string } & (
	| { kind: "outline"; items: AcceptanceCriterion[] }
	| { kind: "convert" }
	| { kind: "insert" }
);

export function acceptanceCriteriaState(body: string): AcceptanceCriteriaState {
	const section = splitAcceptanceCriteria(body);
	if (section)
		return {
			kind: "outline",
			items: section.items,
			before: section.before.join("\n"),
			after: section.after.join("\n"),
		};

	const slice = acceptanceSectionSlice(body);
	if (slice)
		return {
			kind: "convert",
			before: [...slice.before, ...slice.lines].join("\n"),
			after: slice.after.join("\n"),
		};

	return { kind: "insert", before: body, after: "" };
}
