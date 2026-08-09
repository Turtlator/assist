import * as fs from "node:fs";
import * as readline from "node:readline";

const DEFAULT_MAX_LINES = 80;

export async function readCodexHeadLines(
	filePath: string,
	maxLines = DEFAULT_MAX_LINES,
): Promise<string[]> {
	const stream = fs.createReadStream(filePath, { encoding: "utf8" });
	const reader = readline.createInterface({ input: stream });
	const lines: string[] = [];
	try {
		for await (const line of reader) {
			if (line) lines.push(line);
			if (lines.length >= maxLines) break;
		}
	} catch {
		return lines;
	} finally {
		reader.close();
		stream.destroy();
	}
	return lines;
}
