import { acceptanceSectionSlice } from "./acceptanceSectionSlice";
import { depthsFromIndents, indentWidth } from "./depthsFromIndents";
import { normaliseDepths } from "./normaliseDepths";
import { writeAcceptanceCriteria } from "./writeAcceptanceCriteria";

const LIST_ITEM = /^([ \t]*)(?:[-*+]|\d+[.)])(?:[ \t]+(.*))?$/;
const CHECKBOX = /^\[[ xX]\][ \t]*/;

function leadingWhitespace(line: string): string {
	return line.slice(0, line.length - line.trimStart().length);
}

export function convertAcceptanceCriteria(body: string): string {
	const slice = acceptanceSectionSlice(body);
	if (!slice) return body;

	const parsed = slice.lines
		.filter((line) => line.trim() !== "")
		.map((line) => {
			const match = LIST_ITEM.exec(line);
			return {
				width: indentWidth(match ? match[1] : leadingWhitespace(line)),
				text: (match ? (match[2] ?? "") : line.trim()).replace(CHECKBOX, ""),
			};
		});

	const depths = depthsFromIndents(parsed.map((item) => item.width));
	return writeAcceptanceCriteria(
		body,
		normaliseDepths(
			parsed.map((item, i) => ({ text: item.text, depth: depths[i] })),
		),
	);
}
