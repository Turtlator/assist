export type CsharpStringStart = {
	quote: number;
	verbatim: boolean;
	interpolated: boolean;
	quoteRun: number;
};

export function readCsharpStringStart(
	content: string,
	index: number,
): CsharpStringStart | undefined {
	let cursor = index;
	let verbatim = false;
	let interpolated = false;
	while (content[cursor] === "@" || content[cursor] === "$") {
		if (content[cursor] === "@") verbatim = true;
		else interpolated = true;
		cursor++;
	}
	if (content[cursor] !== '"') return undefined;

	let quoteRun = 0;
	while (content[cursor + quoteRun] === '"') quoteRun++;
	return { quote: cursor, verbatim, interpolated, quoteRun };
}
