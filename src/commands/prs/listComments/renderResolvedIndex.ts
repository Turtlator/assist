import type { Style } from "./commentStyle";
import { type Thread, threadLocation } from "./groupThreads";

const summaryLimit = 100;

function firstLine(body: string): string {
	const line = body.trim().split("\n")[0] ?? "";
	return line.length > summaryLimit
		? `${line.slice(0, summaryLimit - 1)}…`
		: line;
}

export function renderResolvedIndex(threads: Thread[], style: Style): string {
	const lines = [style.cyan(`Resolved threads (${threads.length})`)];
	for (const thread of threads) {
		const first = thread.comments[0];
		if (!first) continue;
		const count =
			thread.comments.length > 1 ? ` (${thread.comments.length} comments)` : "";
		lines.push(
			`  ${style.bold(threadLocation(first))} ${first.user}: ${firstLine(first.body)}${count}`,
		);
	}
	lines.push("");
	return lines.join("\n");
}
