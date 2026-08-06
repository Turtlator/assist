import { readRazorCodeBlockStart } from "./readRazorCodeBlockStart";
import { skipHtmlTag } from "./skipHtmlTag";
import { skipRawTextElement } from "./skipRawTextElement";
import { skipRazorExpression } from "./skipRazorExpression";

export function stepRazorMarkup(
	content: string,
	index: number,
): { next: number; enteredCode: boolean } {
	const blockBody = readRazorCodeBlockStart(content, index);
	if (blockBody !== undefined) return { next: blockBody, enteredCode: true };

	const expressionEnd = skipRazorExpression(content, index);
	if (expressionEnd !== undefined)
		return { next: expressionEnd, enteredCode: false };

	const tagEnd = skipHtmlTag(content, index);
	const next =
		tagEnd === undefined
			? index + 1
			: skipRawTextElement(content, index, tagEnd);
	return { next, enteredCode: false };
}
