import type { Session } from "../createSession";

export type ClosingTree = { path: string; removable: boolean };

export function treeUnderClose(session: Session): ClosingTree | undefined {
	if (session.worktree) return { path: session.worktree.path, removable: true };
	if (session.cwd) return { path: session.cwd, removable: false };
	return undefined;
}
