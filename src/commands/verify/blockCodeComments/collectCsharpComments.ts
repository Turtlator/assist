import { csharpHeaderLineCount } from "../../../shared/csharpHeaderLineCount";
import type { ExtractedComment } from "../../../shared/ExtractedComment";
import { extractCsharpComments } from "../../../shared/extractCsharpComments";

export function collectCsharpComments(content: string): ExtractedComment[] {
	const headerLines = csharpHeaderLineCount(content);
	return extractCsharpComments(content).filter(
		(comment) => comment.line > headerLines,
	);
}
