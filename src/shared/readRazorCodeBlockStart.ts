const CODE_KEYWORDS = ["code", "functions"];
const WHITESPACE = new Set([" ", "\t", "\r", "\n"]);

export function readRazorCodeBlockStart(
	content: string,
	index: number,
): number | undefined {
	if (content[index] !== "@") return undefined;

	let cursor = index + 1;
	const keyword = CODE_KEYWORDS.find((word) =>
		content.startsWith(word, cursor),
	);
	if (keyword) {
		cursor += keyword.length;
		while (WHITESPACE.has(content[cursor] ?? "")) cursor++;
	}

	return content[cursor] === "{" ? cursor + 1 : undefined;
}
