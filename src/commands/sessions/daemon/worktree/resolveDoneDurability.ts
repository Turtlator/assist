import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { setStatus } from "../setStatus";
import { reapWorktree } from "./reapWorktree";
import { checkDurability } from "./treeDurability";
import { watchGitState } from "./watchGitState";

export async function resolveDoneDurability(
	session: Session,
	finalize: () => void,
	notify: () => void,
): Promise<void> {
	const worktree = session.worktree;
	if (!worktree) {
		finalize();
		return;
	}
	const durability = await checkDurability(worktree.path);
	if (!durability.durable) {
		holdStopped(session, durability.reason, finalize, notify);
		return;
	}
	await reapWorktree(worktree.path);
	session.worktree = undefined;
	session.undurable = undefined;
	session.gitWatcher?.close();
	session.gitWatcher = undefined;
	finalize();
}

function holdStopped(
	session: Session,
	reason: string,
	finalize: () => void,
	notify: () => void,
): void {
	if (session.undurable?.reason !== reason)
		daemonLog(`session ${session.id} stopped; reap blocked: ${reason}`);
	session.undurable = { reason };
	setStatus(session, "stopped");
	if (!session.gitWatcher && session.worktree)
		session.gitWatcher = watchGitState(session.worktree.path, () => {
			if (session.status !== "stopped") return;
			void resolveDoneDurability(session, finalize, notify);
		});
	notify();
}
