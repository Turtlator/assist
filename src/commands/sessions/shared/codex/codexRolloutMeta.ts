import {
	type CodexRolloutEntry,
	parseRolloutEntry,
	rolloutPayload,
	rolloutString,
} from "./parseRolloutEntry";

type CodexRolloutMeta = {
	sessionId: string;
	cwd: string;
	timestamp: string;
	firstMessage: string;
};

const MAX_FIRST_MESSAGE = 2000;

export function codexRolloutMeta(lines: string[]): CodexRolloutMeta {
	const meta: CodexRolloutMeta = {
		sessionId: "",
		cwd: "",
		timestamp: "",
		firstMessage: "",
	};
	for (const line of lines) {
		const entry = parseRolloutEntry(line);
		if (!entry) continue;
		applySessionMeta(meta, entry);
		meta.firstMessage ||= firstUserMessage(entry);
		if (meta.sessionId && meta.firstMessage) break;
	}
	return meta;
}

function applySessionMeta(
	meta: CodexRolloutMeta,
	entry: CodexRolloutEntry,
): void {
	if (entry.type !== "session_meta") return;
	const payload = rolloutPayload(entry);
	meta.sessionId ||= rolloutString(payload.session_id);
	meta.cwd ||= rolloutString(payload.cwd);
	meta.timestamp ||= rolloutString(payload.timestamp);
}

function firstUserMessage(entry: CodexRolloutEntry): string {
	if (entry.type !== "event_msg") return "";
	const payload = rolloutPayload(entry);
	if (payload.type !== "user_message") return "";
	return rolloutString(payload.message).trim().slice(0, MAX_FIRST_MESSAGE);
}
