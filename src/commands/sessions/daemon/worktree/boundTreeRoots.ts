import { findRepoRoot } from "../../../../shared/findRepoRoot";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { checkDurabilitySync } from "./treeDurability";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function boundTreeRoots(
	sessions: Map<string, Session>,
	exclude?: Session,
): Set<string> {
	const roots = new Set<string>();
	for (const session of sessions.values()) {
		if (session === exclude) continue;
		const root = treeRootOf(session);
		if (root && !roots.has(root) && holdsTree(session, root)) roots.add(root);
	}
	return roots;
}

function treeRootOf(session: Session): string | undefined {
	if (!session.cwd) return undefined;
	return findRepoRoot(session.cwd) ?? session.cwd;
}

function holdsTree(session: Session, root: string): boolean {
	if (session.closing) return true;
	if (session.status !== "done" && session.status !== "error") return true;
	if (!worktreeConfigFor(root).enabled) return true;
	const durability = checkDurabilitySync(root);
	daemonLog(
		durability.durable
			? `tree ${root} free for allocation: session ${session.id} finished and its work is landed`
			: `tree ${root} still held by finished session ${session.id}: ${durability.reason}`,
	);
	return !durability.durable;
}
