import { acceptanceSectionSlice } from "./acceptanceSectionSlice";
import { depthsFromIndents, indentWidth } from "./depthsFromIndents";

export type AcceptanceCriterion = { text: string; depth: number };

type AcceptanceCriteriaSection = {
	before: string[];
	items: AcceptanceCriterion[];
	after: string[];
};

const ORDERED_ITEM = /^([ \t]*)\d+[.)](?:[ \t]+(.*))?$/;

export function splitAcceptanceCriteria(
	body: string,
): AcceptanceCriteriaSection | null {
	const slice = acceptanceSectionSlice(body);
	if (!slice) return null;

	const parsed: { width: number; text: string }[] = [];
	for (const line of slice.lines) {
		if (line.trim() === "") continue;
		const match = ORDERED_ITEM.exec(line);
		if (!match) return null;
		parsed.push({ width: indentWidth(match[1]), text: match[2] ?? "" });
	}

	const depths = depthsFromIndents(parsed.map((item) => item.width));
	return {
		before: slice.before,
		items: parsed.map((item, i) => ({ text: item.text, depth: depths[i] })),
		after: slice.after,
	};
}
