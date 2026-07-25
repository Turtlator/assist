export function diffQuery(cwd: string, sessionId?: string): string {
	const params = new URLSearchParams({ cwd });
	if (sessionId) params.set("session", sessionId);
	return params.toString();
}
