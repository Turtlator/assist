export function readCsharpComment(
	content: string,
	index: number,
): { end: number; text: string } | undefined {
	if (content[index] !== "/") return undefined;

	if (content[index + 1] === "/") {
		const lineEnd = content.indexOf("\n", index);
		const end = lineEnd === -1 ? content.length : lineEnd;
		return { end, text: content.slice(index, end) };
	}

	if (content[index + 1] === "*") {
		const close = content.indexOf("*/", index + 2);
		const end = close === -1 ? content.length : close + 2;
		return { end, text: content.slice(index, end) };
	}

	return undefined;
}
