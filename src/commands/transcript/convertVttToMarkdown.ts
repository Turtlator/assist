import { cuesToChatMessages, formatChatLog } from "./convert/formatChatLog";
import { readCleanedCues } from "./convert/readCleanedCues";

export function convertVttToMarkdown(inputPath: string): string {
	return formatChatLog(cuesToChatMessages(readCleanedCues(inputPath)));
}
