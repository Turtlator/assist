export type ConfigScope = "project" | "global";

type SaveConfigValueRequest = {
	key: string;
	value: unknown;
	cwd: string;
	scope: ConfigScope;
};

export async function saveConfigValue(
	request: SaveConfigValueRequest,
): Promise<{ error?: string }> {
	try {
		const res = await fetch("/api/config/set", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(request),
		});
		const body = await res.json().catch(() => null);
		if (!res.ok) return { error: body?.error ?? `HTTP ${res.status}` };
		return {};
	} catch {
		return { error: "Failed to save config" };
	}
}
