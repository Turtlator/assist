import { loadJson, saveJson } from "../../../../shared/loadJson";

const REGISTRY_FILE = "worktrees.json";

type WorktreeRecord = {
	path: string;
	clone: string;
	origin: string;
};

type Registry = Record<string, { clone: string; origin: string }>;

export function readWorktreeRegistry(): WorktreeRecord[] {
	const data = loadJson<Registry>(REGISTRY_FILE);
	return Object.entries(data).map(([path, record]) => ({ path, ...record }));
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
