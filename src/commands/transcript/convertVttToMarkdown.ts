import { readFileSync } from "node:fs";
import { cuesToChatMessages, formatChatLog } from "./convert/formatChatLog";
import { deduplicateCues, parseVtt } from "./convert/parseVtt";

export function convertVttToMarkdown(inputPath: string): string {
	const cues = parseVtt(readFileSync(inputPath, "utf8"));
	const messages = cuesToChatMessages(deduplicateCues(cues));
	return formatChatLog(messages);
}
