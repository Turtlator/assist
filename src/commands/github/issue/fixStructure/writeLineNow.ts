import { writeSync } from "node:fs";

// why: node buffers stdout when it is a pipe, so a long run looks hung unless every line is pushed out synchronously
export function writeLineNow(line: string): void {
	const text = `${line}\n`;
	try {
		writeSync(1, text);
	} catch {
		process.stdout.write(text);
	}
}
