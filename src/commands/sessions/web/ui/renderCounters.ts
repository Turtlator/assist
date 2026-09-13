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

let enabled = readFlag();
const listeners = new Set<() => void>();

export const renderCounters = new Map<string, number>();

export function countRender(label: string): void {
	if (!enabled) return;
	renderCounters.set(label, (renderCounters.get(label) ?? 0) + 1);
}

export function renderHudEnabled(): boolean {
	return enabled;
}

export function setRenderHudEnabled(on: boolean): void {
	enabled = on;
	renderCounters.clear();
	try {
		if (on) localStorage.setItem(STORAGE_KEY, "1");
		else localStorage.removeItem(STORAGE_KEY);
	} catch {}
	for (const listener of listeners) listener();
}

export function subscribeRenderHud(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
