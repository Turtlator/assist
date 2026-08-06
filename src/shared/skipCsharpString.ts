import {
	type CsharpStringStart,
	readCsharpStringStart,
} from "./readCsharpStringStart";
import { skipCsharpCharLiteral } from "./skipCsharpCharLiteral";
import { skipCsharpRawString } from "./skipCsharpRawString";

function skipInterpolationHole(content: string, index: number): number {
	let cursor = index;
	let depth = 1;
	while (cursor < content.length) {
		const char = content[cursor];
		if (char === "{") depth++;
		else if (char === "}" && --depth === 0) return cursor + 1;
		else if (char === "'") {
			cursor = skipCsharpCharLiteral(content, cursor);
			continue;
		} else {
			const nested = skipCsharpString(content, cursor);
			if (nested !== undefined) {
				cursor = nested;
				continue;
			}
		}
		cursor++;
	}
	return content.length;
}

function skipDelimitedString(
	content: string,
	start: CsharpStringStart,
): number {
	const { quote, verbatim, interpolated } = start;
	let cursor = quote + 1;
	while (cursor < content.length) {
		const char = content[cursor];
		if (char === "\\" && !verbatim) cursor += 2;
		else if (char === "\n" && !verbatim) return cursor;
		else if (char === '"') {
			if (!verbatim || content[cursor + 1] !== '"') return cursor + 1;
			cursor += 2;
		} else if (interpolated && char === "{")
			cursor =
				content[cursor + 1] === "{"
					? cursor + 2
					: skipInterpolationHole(content, cursor + 1);
		else cursor++;
	}
	return content.length;
}

export function skipCsharpString(
	content: string,
	index: number,
): number | undefined {
	const start = readCsharpStringStart(content, index);
	if (!start) return undefined;
	if (!start.verbatim && start.quoteRun >= 3)
		return skipCsharpRawString(content, start.quote, start.quoteRun);
	return skipDelimitedString(content, start);
}
