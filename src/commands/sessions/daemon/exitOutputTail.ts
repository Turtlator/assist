import { stripAnsi } from "../../../shared/stripAnsi";

const MAX_TAIL_LINES = 5;
const MAX_TAIL_CHARS = 500;

export function exitOutputTail(scrollback: string): string | undefined {
	const lines = stripAnsi(scrollback)
		.split(/\r?\n|\r/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);
	if (lines.length === 0) return undefined;
	return lines.slice(-MAX_TAIL_LINES).join(" | ").slice(-MAX_TAIL_CHARS);
}
