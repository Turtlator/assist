const ACCEPTANCE_HEADING = /^ {0,3}#{1,6}[ \t]+acceptance criteria[ \t]*$/i;
const ANY_HEADING = /^ {0,3}#{1,6}[ \t]/;

type AcceptanceSectionSlice = {
	before: string[];
	lines: string[];
	after: string[];
};

export function acceptanceSectionSlice(
	body: string,
): AcceptanceSectionSlice | null {
	const lines = body.split("\n");
	const heading = lines.findIndex((line) => ACCEPTANCE_HEADING.test(line));
	if (heading === -1) return null;

	let end = heading + 1;
	while (end < lines.length && !ANY_HEADING.test(lines[end])) end += 1;

	let start = heading + 1;
	while (start < end && lines[start].trim() === "") start += 1;
	let last = end;
	while (last > start && lines[last - 1].trim() === "") last -= 1;
	if (start === end) {
		start = heading + 1;
		last = heading + 1;
	}

	return {
		before: lines.slice(0, start),
		lines: lines.slice(start, last),
		after: lines.slice(last),
	};
}
