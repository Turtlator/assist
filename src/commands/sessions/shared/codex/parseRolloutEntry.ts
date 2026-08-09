export type CodexRolloutEntry = { type?: unknown; payload?: unknown };

export function parseRolloutEntry(line: string): CodexRolloutEntry | null {
	try {
		const parsed: unknown = JSON.parse(line);
		return parsed && typeof parsed === "object"
			? (parsed as CodexRolloutEntry)
			: null;
	} catch {
		return null;
	}
}

export function rolloutPayload(entry: CodexRolloutEntry) {
	return entry.payload && typeof entry.payload === "object"
		? (entry.payload as Record<string, unknown>)
		: {};
}

export function rolloutString(value: unknown): string {
	return typeof value === "string" ? value : "";
}
