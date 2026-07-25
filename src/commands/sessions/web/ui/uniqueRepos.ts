import { repoGroupCwd, repoGroupKey, repoKeyForCwd } from "./repoGroupKey";
import type { HistoricalSession } from "./types";

export function uniqueRepos(
	currentCwd: string,
	history: HistoricalSession[],
): string[] {
	const seen = new Set<string>();
	const ordered: string[] = [];
	for (const s of history) {
		const key = repoGroupKey(s);
		const cwd = repoGroupCwd(s);
		if (!key || !cwd || seen.has(key)) continue;
		seen.add(key);
		ordered.push(cwd);
	}
	if (currentCwd && !seen.has(repoKeyForCwd(currentCwd, history)))
		ordered.unshift(currentCwd);
	return ordered;
}
