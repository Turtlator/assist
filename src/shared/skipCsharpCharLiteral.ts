const CHAR_LITERAL_MAX_LENGTH = 12;

export function skipCsharpCharLiteral(content: string, index: number): number {
	const limit = Math.min(content.length, index + CHAR_LITERAL_MAX_LENGTH);
	let cursor = index + 1;
	while (cursor < limit) {
		const char = content[cursor];
		if (char === "\n") break;
		if (char === "\\") {
			cursor += 2;
			continue;
		}
		if (char === "'") return cursor + 1;
		cursor++;
	}
	return index + 1;
}
