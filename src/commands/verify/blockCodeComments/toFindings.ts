import type { ExtractedComment } from "../../../shared/ExtractedComment";
import type { CommentFinding } from "./types";
import { isCommentExempt } from "./isCommentExempt";

export function toFindings(
	file: string,
	lines: Set<number>,
	raw: ExtractedComment[],
	exempt: boolean,
): CommentFinding[] {
	const findings: CommentFinding[] = [];
	for (const { line, text } of raw) {
		if (!lines.has(line)) continue;
		if (exempt && isCommentExempt(text)) continue;
		findings.push({ file, line, text: text.replace(/\s+/g, " ").trim() });
	}
	return findings;
}
