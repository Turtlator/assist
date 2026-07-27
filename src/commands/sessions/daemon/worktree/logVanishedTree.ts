import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";

export function logVanishedTree(
	sessions: Map<string, Session>,
	path: string,
): void {
	const claimants = [...sessions.values()].filter(
		(s) => s.cwd === path || s.worktree?.path === path,
	);
	if (claimants.length === 0) {
		daemonLog(`worktree ${path} gone from disk and unclaimed; reclaiming it`);
		return;
	}
	for (const s of claimants)
		daemonLog(
			`session ${s.id} ("${s.name}") claims worktree ${path}, which is gone from disk; reclaiming it`,
		);
}
