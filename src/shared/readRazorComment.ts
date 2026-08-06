const RAZOR_OPEN = "@*";
const RAZOR_CLOSE = "*@";
const HTML_OPEN = "<!--";
const HTML_CLOSE = "-->";

function read(
	content: string,
	index: number,
	open: string,
	close: string,
): { end: number; text: string } {
	const found = content.indexOf(close, index + open.length);
	const end = found === -1 ? content.length : found + close.length;
	return { end, text: content.slice(index, end) };
}

export function readRazorComment(
	content: string,
	index: number,
): { end: number; text: string } | undefined {
	if (content.startsWith(RAZOR_OPEN, index))
		return read(content, index, RAZOR_OPEN, RAZOR_CLOSE);
	if (content.startsWith(HTML_OPEN, index))
		return read(content, index, HTML_OPEN, HTML_CLOSE);
	return undefined;
}
