export type DiffComment = {
	path: string;
	startLine: number;
	endLine: number;
	quote: string;
	note: string;
};

function fenceFor(quote: string): string {
	const longest = Math.max(
		0,
		...Array.from(quote.matchAll(/`+/g), (m) => m[0].length),
	);
	return "`".repeat(Math.max(3, longest + 1));
}

export function formatDiffComment({
	path,
	startLine,
	endLine,
	quote,
	note,
}: DiffComment): string {
	const lines =
		startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
	const fence = fenceFor(quote);
	return `${path}:${lines}\n\n${fence}\n${quote}\n${fence}\n\n${note}`;
}
