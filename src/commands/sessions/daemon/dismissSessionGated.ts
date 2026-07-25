import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { dismissSession } from "./dismissSession";
import { killPtyTree } from "./killPtyTree";
import { reapWorktree } from "./worktree/reapWorktree";
import { resolveDoneDurability } from "./worktree/resolveDoneDurability";

export function dismissSessionGated(
	sessions: Map<string, Session>,
	id: string,
	notify: () => void,
	discard = false,
): void {
	const s = sessions.get(id);
	if (!s?.worktree) {
		if (dismissSession(sessions, id)) notify();
		return;
	}
	const removeCard = () => {
		if (dismissSession(sessions, id)) notify();
	};
	const discardTree = async () => {
		if (s.worktree) {
			await reapWorktree(s.worktree.path, true);
			s.worktree = undefined;
		}
		removeCard();
	};
	s.closing = true;
	if (s.pty) {
		s.pendingDismiss = discard
			? () => void discardTree()
			: () => void resolveDoneDurability(s, removeCard, notify);
		daemonLog(
			`session ${id} ${discard ? "discard" : "dismiss"} requested: killing process tree first`,
		);
		killPtyTree(s.pty);
		notify();
		return;
	}
	notify();
	if (discard) void discardTree();
	else void resolveDoneDurability(s, removeCard, notify);
}
