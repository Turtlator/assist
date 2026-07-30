import { parseUserLine } from "./parseUserLine";
import { readTranscriptHead } from "./readTranscriptHead";

/**
 * Read a session JSONL file and yield the text of each user message.
 * Reads up to `maxBytes` from the start of the file (default 64KB).
 */
export function* iterateUserMessages(
	filePath: string,
	maxBytes = 65_536,
): Generator<string> {
	const content = readTranscriptHead(filePath, maxBytes);
	if (content === undefined) return;

	for (const line of content.split("\n")) {
		if (!line) continue;
		const entry = parseUserLine(line);
		if (entry) yield entry.text;
	}
}
