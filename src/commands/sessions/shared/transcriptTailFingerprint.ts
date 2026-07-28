const CONVERSATION_TYPES = new Set(["user", "assistant"]);

export function transcriptTailFingerprint(
	entries: Record<string, unknown>[],
): string | null {
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry.isSidechain || entry.isMeta) continue;
		if (typeof entry.type !== "string" || !CONVERSATION_TYPES.has(entry.type))
			continue;
		return typeof entry.uuid === "string" && entry.uuid ? entry.uuid : null;
	}
	return null;
}
