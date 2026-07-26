export function gitFailureReason(error: unknown): string {
	const streams = error as { stderr?: unknown; stdout?: unknown };

	for (const stream of [streams?.stderr, streams?.stdout]) {
		const text = stream == null ? "" : String(stream).trim();
		if (text) return text;
	}

	const message = error instanceof Error ? error.message : String(error);
	return message.trim() || "git failed without reporting a reason";
}
