import type { LineComment } from "../types";

export type Thread = {
	id: string;
	resolved: boolean;
	comments: LineComment[];
};

export function threadLocation(comment: LineComment): string {
	return comment.line ? `${comment.path}:${comment.line}` : comment.path;
}

export function groupThreads(comments: LineComment[]): Thread[] {
	const threads = new Map<string, Thread>();
	for (const comment of comments) {
		const id = comment.threadId || `comment-${comment.id}`;
		const existing = threads.get(id);
		if (existing) {
			existing.comments.push(comment);
			continue;
		}
		threads.set(id, { id, resolved: comment.resolved, comments: [comment] });
	}
	return [...threads.values()];
}
