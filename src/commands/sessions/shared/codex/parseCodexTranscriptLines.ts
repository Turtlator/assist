import type { TranscriptMessage } from "../entryMessages";
import {
	type CodexRolloutEntry,
	parseRolloutEntry,
	rolloutPayload,
	rolloutString,
} from "./parseRolloutEntry";
import { codexToolTarget } from "./codexToolTarget";

export function parseCodexTranscriptLines(
	lines: string[],
): TranscriptMessage[] {
	const messages: TranscriptMessage[] = [];
	for (const line of lines) {
		const entry = line.trim() ? parseRolloutEntry(line) : null;
		if (entry) messages.push(...rolloutMessages(entry));
	}
	return messages;
}

function rolloutMessages(entry: CodexRolloutEntry): TranscriptMessage[] {
	const payload = rolloutPayload(entry);
	if (entry.type === "event_msg") return chatMessages(payload);
	if (entry.type === "response_item") return toolMessages(payload);
	return [];
}

function chatMessages(payload: Record<string, unknown>): TranscriptMessage[] {
	if (payload.type === "user_message")
		return text("user", rolloutString(payload.message));
	if (payload.type === "agent_message")
		return text("assistant", rolloutString(payload.message));
	return [];
}

function toolMessages(payload: Record<string, unknown>): TranscriptMessage[] {
	if (payload.type !== "function_call" && payload.type !== "custom_tool_call")
		return [];
	return [
		{
			role: "tool",
			tool: rolloutString(payload.name) || "tool",
			target: codexToolTarget(payload),
		},
	];
}

function text(role: "user" | "assistant", value: string): TranscriptMessage[] {
	const trimmed = value.trim();
	return trimmed ? [{ role, text: trimmed }] : [];
}
