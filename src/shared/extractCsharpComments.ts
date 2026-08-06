import type { ExtractedComment } from "./ExtractedComment";
import { lineCounter } from "./lineCounter";
import { readCsharpComment } from "./readCsharpComment";
import { skipCsharpCharLiteral } from "./skipCsharpCharLiteral";
import { skipCsharpString } from "./skipCsharpString";

const WHITESPACE = new Set([" ", "\t", "\r"]);

export function extractCsharpComments(content: string): ExtractedComment[] {
	const comments: ExtractedComment[] = [];
	const lineOf = lineCounter(content);
	let index = 0;
	let atLineStart = true;

	while (index < content.length) {
		const char = content[index];

		if (char === "\n") {
			atLineStart = true;
			index++;
		} else if (WHITESPACE.has(char)) {
			index++;
		} else if (atLineStart && char === "#") {
			const lineEnd = content.indexOf("\n", index);
			index = lineEnd === -1 ? content.length : lineEnd;
		} else {
			atLineStart = false;
			const comment = readCsharpComment(content, index);
			const afterString = comment
				? undefined
				: skipCsharpString(content, index);
			if (comment) {
				comments.push({ line: lineOf(index), text: comment.text });
				index = comment.end;
			} else if (char === "'") index = skipCsharpCharLiteral(content, index);
			else if (afterString !== undefined) index = afterString;
			else index++;
		}
	}

	return comments;
}
