export function skipCsharpRawString(
	content: string,
	quote: number,
	quoteRun: number,
): number {
	let cursor = quote + quoteRun;
	while (cursor < content.length) {
		if (content[cursor] !== '"') {
			cursor++;
			continue;
		}
		let run = 0;
		while (content[cursor + run] === '"') run++;
		if (run >= quoteRun) return cursor + run;
		cursor += run;
	}
	return content.length;
}
