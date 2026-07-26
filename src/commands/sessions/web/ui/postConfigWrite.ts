export async function postConfigWrite(
	path: string,
	body: unknown,
	failureMessage: string,
): Promise<{ error?: string }> {
	try {
		const res = await fetch(path, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const parsed = await res.json().catch(() => null);
		if (!res.ok) return { error: parsed?.error ?? `HTTP ${res.status}` };
		return {};
	} catch {
		return { error: failureMessage };
	}
}
