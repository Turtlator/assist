import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import {
	type AllocateOptions,
	type Allocation,
	allocateTree,
} from "./allocateTree";
import { boundTreeRoots } from "./boundTreeRoots";
import type { TreeSpawnContext } from "./spawnInTree";

export function planReuseTree(
	session: Session,
	ctx: TreeSpawnContext | undefined,
	options: AllocateOptions = {},
): Allocation | undefined {
	if (!ctx || !session.cwd || session.worktree) return undefined;
	const alloc = allocateTree(
		session.cwd,
		boundTreeRoots(ctx.sessions, session),
		options,
	);
	if (alloc.kind !== "worktree" || !alloc.cwd) return undefined;
	daemonLog(
		`session ${session.id} moved from ${session.cwd} to ${alloc.cwd} for its chained run`,
	);
	return alloc;
}
