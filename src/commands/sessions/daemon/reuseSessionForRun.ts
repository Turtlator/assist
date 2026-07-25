import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { resetCardForRun } from "./resetCardForRun";
import { spawnPty } from "./spawnPty";
import { startOrHoldPty } from "./startOrHoldPty";
import { wirePtyEvents } from "./wirePtyEvents";
import { bindNewWorktree } from "./worktree/bindNewWorktree";
import { planReuseTree } from "./worktree/planReuseTree";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

export function reuseSessionForRun(
	session: Session,
	itemId: number,
	clients: Set<SessionClient>,
	onStatusChange: (
		s: Session,
		status: Session["status"],
		exitCode?: number,
	) => void,
	tree?: TreeSpawnContext,
): void {
	const assistArgs = ["backlog", "run", String(itemId)];
	resetCardForRun(session, assistArgs);
	const alloc = planReuseTree(session, tree);
	if (alloc) session.cwd = alloc.cwd;
	Object.assign(
		session,
		startOrHoldPty(
			() => spawnPty(["assist", ...assistArgs], session.cwd, session.id),
			alloc !== undefined,
		),
	);
	broadcast(clients, { type: "clear", sessionId: session.id });
	if (alloc)
		bindNewWorktree(
			session,
			alloc,
			tree?.notify ?? (() => {}),
			tree?.startHeld,
		);
	else wirePtyEvents(session, clients, onStatusChange);
	daemonLog(
		`session ${session.id} reused for backlog run ${itemId}: ${session.name}`,
	);
}
