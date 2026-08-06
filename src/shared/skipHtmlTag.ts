const TAG_NAME_START = /[A-Za-z/]/;

export function skipHtmlTag(
	content: string,
	index: number,
): number | undefined {
	if (content[index] !== "<") return undefined;
	if (!TAG_NAME_START.test(content[index + 1] ?? "")) return undefined;

	let cursor = index + 1;
	while (cursor < content.length) {
		const char = content[cursor];
		if (char === '"' || char === "'") {
			const close = content.indexOf(char, cursor + 1);
			if (close === -1) return undefined;
			cursor = close + 1;
		} else if (char === ">") return cursor + 1;
		else cursor++;
	}

	return undefined;
}
