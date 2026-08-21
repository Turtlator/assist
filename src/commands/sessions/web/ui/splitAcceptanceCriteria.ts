import { depthsFromIndents, indentWidth } from "./depthsFromIndents";

export type AcceptanceCriterion = { text: string; depth: number };

type AcceptanceCriteriaSection = {
	before: string[];
	items: AcceptanceCriterion[];
	after: string[];
};

const ACCEPTANCE_HEADING = /^ {0,3}#{1,6}[ \t]+acceptance criteria[ \t]*$/i;
const ANY_HEADING = /^ {0,3}#{1,6}[ \t]/;
const ORDERED_ITEM = /^([ \t]*)\d+[.)](?:[ \t]+(.*))?$/;

function sectionEnd(lines: string[], heading: number): number {
	let end = heading + 1;
	while (end < lines.length && !ANY_HEADING.test(lines[end])) end += 1;
	return end;
}

export function splitAcceptanceCriteria(
	body: string,
): AcceptanceCriteriaSection | null {
	const lines = body.split("\n");
	const heading = lines.findIndex((line) => ACCEPTANCE_HEADING.test(line));
	if (heading === -1) return null;

	const end = sectionEnd(lines, heading);
	const parsed: { line: number; width: number; text: string }[] = [];
	for (let i = heading + 1; i < end; i += 1) {
		if (lines[i].trim() === "") continue;
		const match = ORDERED_ITEM.exec(lines[i]);
		if (!match) return null;
		parsed.push({
			line: i,
			width: indentWidth(match[1]),
			text: match[2] ?? "",
		});
	}

	const depths = depthsFromIndents(parsed.map((item) => item.width));
	const start = parsed.length > 0 ? parsed[0].line : heading + 1;
	const last =
		parsed.length > 0 ? parsed[parsed.length - 1].line + 1 : heading + 1;

	return {
		before: lines.slice(0, start),
		items: parsed.map((item, i) => ({ text: item.text, depth: depths[i] })),
		after: lines.slice(last),
	};
}
