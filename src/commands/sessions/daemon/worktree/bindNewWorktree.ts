import { findRepoRoot } from "../../../../shared/findRepoRoot";
import type { Session } from "../createSession";
import type { Allocation } from "./allocateTree";
import { detectExistingWorktree } from "./detectExistingWorktree";
import { seedWorktree } from "./seedWorktree";

export function boundTreeRoots(sessions: Map<string, Session>): Set<string> {
	const roots = new Set<string>();
	for (const session of sessions.values())
		if (session.cwd) roots.add(findRepoRoot(session.cwd) ?? session.cwd);
	return roots;
}

export function bindNewWorktree(
	session: Session | undefined,
	alloc: Allocation,
	notify: () => void,
): void {
	if (alloc.kind !== "worktree" || !alloc.cwd || !alloc.clone || !session)
		return;
	session.worktree = { path: alloc.cwd, clone: alloc.clone };
	if (alloc.created) seedWorktree(alloc.cwd, alloc.clone);
	notify();
}

export function bindRestoredWorktrees(sessions: Map<string, Session>): void {
	for (const session of sessions.values()) {
		if (session.worktree || !session.cwd) continue;
		const worktree = detectExistingWorktree(session.cwd);
		if (worktree) session.worktree = worktree;
	}
}

export function bindResumedWorktree(
	session: Session | undefined,
	cwd: string,
	notify: () => void,
): void {
	if (!session) return;
	const worktree = detectExistingWorktree(cwd);
	if (!worktree) return;
	session.worktree = worktree;
	notify();
}
