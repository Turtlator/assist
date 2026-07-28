import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { emitSessionOutput } from "./emitSessionOutput";
import { setStatus } from "./setStatus";
import type { TreeSpawnContext } from "./worktree/spawnInTree";

export function failChainedRun(
	session: Session,
	itemId: number,
	error: unknown,
	clients: Set<SessionClient>,
	tree: TreeSpawnContext | undefined,
): void {
	const reason = error instanceof Error ? error.message : String(error);
	session.pty = null;
	session.error = `backlog run ${itemId} could not start: ${reason}`;
	setStatus(session, "error");
	daemonLog(
		`session ${session.id} not reused for backlog run ${itemId}: workspace allocation failed: ${reason}`,
	);
	broadcast(clients, { type: "clear", sessionId: session.id });
	emitSessionOutput(
		session,
		clients,
		`\r\n\x1b[31m${session.error}\x1b[0m\r\n`,
	);
	tree?.notify();
}
