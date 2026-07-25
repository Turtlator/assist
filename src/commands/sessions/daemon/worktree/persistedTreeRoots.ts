import { findRepoRoot } from "../../../../shared/findRepoRoot";
import { loadPersistedSessions } from "../loadPersistedSessions";

export function persistedTreeRoots(): Set<string> {
	const roots = new Set<string>();
	for (const { cwd } of loadPersistedSessions()) {
		if (cwd) roots.add(findRepoRoot(cwd) ?? cwd);
	}
	return roots;
}
