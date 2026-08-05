import type { Style } from "./commentStyle";
import { type Thread, threadLocation } from "./groupThreads";

function indent(text: string): string {
	return text
		.split("\n")
		.map((line) => (line ? `  ${line}` : line))
		.join("\n");
}

export function renderThreadBlock(thread: Thread, style: Style): string {
	const first = thread.comments[0];
	if (!first) return "";
	const lines = [
		`${style.cyan("Thread")} on ${style.bold(threadLocation(first))}`,
	];
	if (style.diffHunk) {
		lines.push(
			indent(style.dim(first.diff_hunk.split("\n").slice(-3).join("\n"))),
		);
	}
	for (const comment of thread.comments) {
		lines.push(
			indent(
				[
					`${style.bold(comment.user)} ${style.dim(comment.html_url)}`,
					comment.body,
					"",
				].join("\n"),
			),
		);
	}
	return lines.join("\n");
}
