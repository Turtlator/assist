import {
	type AcceptanceCriterion,
	splitAcceptanceCriteria,
} from "./splitAcceptanceCriteria";

const LEVEL_INDENT = "   ";

function criterionLine({ text, depth }: AcceptanceCriterion): string {
	const marker = `${LEVEL_INDENT.repeat(depth)}1.`;
	return text === "" ? marker : `${marker} ${text}`;
}

export function writeAcceptanceCriteria(
	body: string,
	items: AcceptanceCriterion[],
): string {
	const section = splitAcceptanceCriteria(body);
	if (!section) return body;
	return [
		...section.before,
		...items.map(criterionLine),
		...section.after,
	].join("\n");
}
