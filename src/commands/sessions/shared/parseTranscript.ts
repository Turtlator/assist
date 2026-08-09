import * as fs from "node:fs";
import { findCodexRolloutPath } from "./codex/findCodexRolloutPath";
import { parseCodexTranscriptLines } from "./codex/parseCodexTranscriptLines";
import { entryMessages, type TranscriptMessage } from "./entryMessages";
import { findSessionJsonlPath } from "./findSessionJsonlPath";

export async function parseTranscript(
	sessionId: string,
): Promise<TranscriptMessage[]> {
	const filePath = await findSessionJsonlPath(sessionId);
	if (filePath) return readMessages(filePath, parseTranscriptLines);
	const rollout = await findCodexRolloutPath(sessionId);
	if (rollout) return readMessages(rollout, parseCodexTranscriptLines);
	return [];
}

async function readMessages(
	filePath: string,
	parse: (lines: string[]) => TranscriptMessage[],
): Promise<TranscriptMessage[]> {
	try {
		const raw = await fs.promises.readFile(filePath, "utf8");
		return parse(raw.split("\n"));
	} catch {
		return [];
	}
}

export function parseTranscriptLines(lines: string[]): TranscriptMessage[] {
	const messages: TranscriptMessage[] = [];
	for (const line of lines) {
		const entry = line.trim() ? safeParse(line) : null;
		if (!entry || entry.isSidechain || entry.isMeta) continue;
		messages.push(...entryMessages(entry));
	}
	return messages;
}

function safeParse(line: string): Record<string, unknown> | null {
	try {
		return JSON.parse(line);
	} catch {
		return null;
	}
}
