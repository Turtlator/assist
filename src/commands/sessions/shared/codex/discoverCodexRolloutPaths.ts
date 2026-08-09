import * as fs from "node:fs";
import * as path from "node:path";
import { codexSessionsDir, hasCodexSessions } from "./codexSessionsDir";

const DATE_DEPTH = 3;

function isCodexRolloutFile(name: string): boolean {
	return name.startsWith("rollout-") && name.endsWith(".jsonl");
}

export async function discoverCodexRolloutPaths(): Promise<string[]> {
	if (!hasCodexSessions()) return [];
	return collect(codexSessionsDir(), DATE_DEPTH);
}

async function collect(dir: string, depth: number): Promise<string[]> {
	let entries: fs.Dirent[];
	try {
		entries = await fs.promises.readdir(dir, { withFileTypes: true });
	} catch {
		return [];
	}
	const nested = await Promise.all(
		entries.map((entry) => collectEntry(dir, entry, depth)),
	);
	return nested.flat();
}

async function collectEntry(
	dir: string,
	entry: fs.Dirent,
	depth: number,
): Promise<string[]> {
	const full = path.join(dir, entry.name);
	if (entry.isDirectory()) return depth > 0 ? collect(full, depth - 1) : [];
	return isCodexRolloutFile(entry.name) ? [full] : [];
}
