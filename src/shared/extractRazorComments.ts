import type { ExtractedComment } from "./ExtractedComment";
import { lineCounter } from "./lineCounter";
import { readRazorComment } from "./readRazorComment";
import { stepRazorCode } from "./stepRazorCode";
import { stepRazorMarkup } from "./stepRazorMarkup";

export function extractRazorComments(content: string): ExtractedComment[] {
	const comments: ExtractedComment[] = [];
	const lineOf = lineCounter(content);
	let index = 0;
	let codeDepth = 0;

	while (index < content.length) {
		if (content[index] === "@" && content[index + 1] === "@") {
			index += 2;
			continue;
		}

		const comment = readRazorComment(content, index);
		if (comment) {
			comments.push({ line: lineOf(index), text: comment.text });
			index = comment.end;
			continue;
		}

		if (codeDepth > 0) {
			const step = stepRazorCode(content, index);
			codeDepth += step.depthChange;
			index = step.next;
			continue;
		}

		const step = stepRazorMarkup(content, index);
		if (step.enteredCode) codeDepth = 1;
		index = step.next;
	}

	return comments;
}
