import { loadJson, saveJson } from "../../../../shared/loadJson";

const REGISTRY_FILE = "worktrees.json";

type WorktreeRecord = {
	path: string;
	clone: string;
	origin: string;
};

type Registry = Record<
	string,
	{ clone: string; origin: string; reaped?: boolean }
>;

export function readWorktreeRegistry(): WorktreeRecord[] {
	const data = loadJson<Registry>(REGISTRY_FILE);
	return Object.entries(data)
		.filter(([, record]) => !record.reaped)
		.map(([path, record]) => ({ path, ...record }));
}

export function worktreeAttributionIncludingReaped(
	path: string,
): { clone: string; origin: string } | undefined {
	const record = loadJson<Registry>(REGISTRY_FILE)[path];
	return record ? { clone: record.clone, origin: record.origin } : undefined;
}

export function recordWorktree(
	path: string,
	clone: string,
	origin: string,
): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	data[path] = { clone, origin };
	saveJson(REGISTRY_FILE, data);
}

export function forgetWorktree(path: string): void {
	const data = loadJson<Registry>(REGISTRY_FILE);
	const record = data[path];
	if (!record || record.reaped) return;
	data[path] = { ...record, reaped: true };
	saveJson(REGISTRY_FILE, data);
}
