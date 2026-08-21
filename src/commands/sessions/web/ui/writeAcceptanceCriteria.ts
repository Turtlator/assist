import { acceptanceSectionSlice } from "./acceptanceSectionSlice";
import type { AcceptanceCriterion } from "./splitAcceptanceCriteria";

const LEVEL_INDENT = "   ";

function criterionLine({ text, depth }: AcceptanceCriterion): string {
	const marker = `${LEVEL_INDENT.repeat(depth)}1.`;
	return text === "" ? marker : `${marker} ${text}`;
}

export function writeAcceptanceCriteria(
	body: string,
	items: AcceptanceCriterion[],
): string {
	const slice = acceptanceSectionSlice(body);
	if (!slice) return body;
	return [...slice.before, ...items.map(criterionLine), ...slice.after].join(
		"\n",
	);
}
