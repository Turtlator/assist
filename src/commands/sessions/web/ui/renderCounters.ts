const STORAGE_KEY = "render-hud";

function readFlag(): boolean {
	try {
		const flag = new URLSearchParams(globalThis.location.search).get("hud");
		if (flag === "1") localStorage.setItem(STORAGE_KEY, "1");
		if (flag === "0") localStorage.removeItem(STORAGE_KEY);
		return localStorage.getItem(STORAGE_KEY) === "1";
	} catch {
		return false;
	}
}

export const renderHudEnabled = readFlag();

export const renderCounters = new Map<string, number>();

export function countRender(label: string): void {
	if (!renderHudEnabled) return;
	renderCounters.set(label, (renderCounters.get(label) ?? 0) + 1);
}
