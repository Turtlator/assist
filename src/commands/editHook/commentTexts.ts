import { isCommentExempt } from "../verify/blockCodeComments/isCommentExempt";

export function commentTexts(comments: { text: string }[]): string[] {
	return comments
		.map((comment) => comment.text.replace(/\s+/g, " ").trim())
		.filter((comment) => comment.length > 0)
		.filter((comment) => !isCommentExempt(comment));
}
