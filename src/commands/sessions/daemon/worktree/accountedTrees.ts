import { findRepoRoot } from "../../../../shared/findRepoRoot";
import type { Session } from "../createSession";
import { loadPersistedSessions } from "../loadPersistedSessions";

export function accountedTrees(sessions: Map<string, Session>): Set<string> {
	const accounted = new Set<string>();
	const account = (cwd: string | undefined) => {
		if (!cwd) return;
		accounted.add(cwd);
		const root = findRepoRoot(cwd);
		if (root) accounted.add(root);
	};
	for (const s of sessions.values()) {
		account(s.cwd);
		account(s.worktree?.path);
	}
	for (const s of loadPersistedSessions()) account(s.cwd);
	return accounted;
}
