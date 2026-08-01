import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import type { OnStatusChange } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";
import type { Allocation } from "./worktree/allocateTree";
import { bindNewWorktree } from "./worktree/bindNewWorktree";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

export function attachReusedRun(
	session: Session,
	alloc: Allocation | undefined,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
	tree?: TreeSpawnContext,
): void {
	broadcast(clients, { type: "clear", sessionId: session.id });
	if (alloc)
		bindNewWorktree(
			session,
			alloc,
			tree?.notify ?? (() => {}),
			tree?.startHeld,
		);
	else wirePtyEvents(session, clients, onStatusChange);
}
