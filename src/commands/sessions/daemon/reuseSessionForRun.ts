import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { refuseSpawn } from "./refuseSpawn";
import { resetCardForRun } from "./resetCardForRun";
import { spawnPty } from "./spawnPty";
import { startOrHoldPty } from "./startOrHoldPty";
import { wirePtyEvents } from "./wirePtyEvents";
import type { Allocation } from "./worktree/allocateTree";
import { bindNewWorktree } from "./worktree/bindNewWorktree";
import { isCommittingArgs } from "./worktree/isCommittingArgs";
import { planReuseTree } from "./worktree/planReuseTree";
import type { TreeSpawnContext } from "./worktree/spawnInTree";
import { failChainedRun } from "./failChainedRun";

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
	let alloc: Allocation | undefined;
	try {
		alloc = planReuseTree(session, tree, {
			commits: isCommittingArgs(assistArgs),
		});
	} catch (error) {
		failChainedRun(session, itemId, error, clients, tree);
		return;
	}
	if (alloc) session.cwd = alloc.cwd;
	try {
		Object.assign(
			session,
			startOrHoldPty(
				() => spawnPty(["assist", ...assistArgs], session.cwd, session.id),
				alloc !== undefined,
			),
		);
	} catch (error) {
		refuseSpawn(
			session,
			error,
			clients,
			onStatusChange,
			`reused for backlog run ${itemId}`,
		);
		return;
	}
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
