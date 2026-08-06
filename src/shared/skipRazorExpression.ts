import { skipCsharpCharLiteral } from "./skipCsharpCharLiteral";
import { skipCsharpString } from "./skipCsharpString";

const IDENT_START = /[A-Za-z_]/;
const IDENT_PART = /[A-Za-z0-9_]/;
const GROUP_CLOSE: Record<string, string> = { "(": ")", "[": "]" };

function skipGroup(content: string, index: number): number | undefined {
	const open = content[index];
	const close = GROUP_CLOSE[open];
	let cursor = index + 1;
	let depth = 1;

	while (cursor < content.length) {
		const char = content[cursor];
		if (char === open) depth++;
		else if (char === close && --depth === 0) return cursor + 1;
		else if (char === "'") {
			cursor = skipCsharpCharLiteral(content, cursor);
			continue;
		} else {
			const afterString = skipCsharpString(content, cursor);
			if (afterString !== undefined) {
				cursor = afterString;
				continue;
			}
		}
		cursor++;
	}

	return undefined;
}

export function skipRazorExpression(
	content: string,
	index: number,
): number | undefined {
	if (content[index] !== "@") return undefined;
	const first = content[index + 1] ?? "";
	if (!IDENT_START.test(first) && !GROUP_CLOSE[first]) return undefined;

	let cursor = index + 1;
	while (cursor < content.length) {
		const char = content[cursor];
		if (IDENT_PART.test(char)) cursor++;
		else if (char === "." && IDENT_START.test(content[cursor + 1] ?? ""))
			cursor++;
		else if (GROUP_CLOSE[char]) {
			const afterGroup = skipGroup(content, cursor);
			if (afterGroup === undefined) return cursor;
			cursor = afterGroup;
		} else break;
	}

	return cursor;
}
