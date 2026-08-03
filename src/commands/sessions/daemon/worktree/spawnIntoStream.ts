import type { HarnessKind } from "../../../../shared/harnesses";
import { createSession, type Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { TreeSpawnContext } from "./spawnInTree";

export function spawnIntoStream(
	ctx: TreeSpawnContext,
	target: Session,
	prompt: string | undefined,
	harness: HarnessKind | undefined,
): string {
	const holdUntilSeeded = target.pendingStart !== undefined;
	const id = ctx.spawnWith(
		(sid) =>
			createSession(sid, prompt, target.cwd, false, harness, holdUntilSeeded),
		{ launchedFrom: target.id },
	);
	const joined = ctx.sessions.get(id);
	if (joined && target.worktree) joined.worktree = { ...target.worktree };
	daemonLog(
		`session ${id} added to the stream of session ${target.id} in ${target.cwd}: no workspace allocated${
			holdUntilSeeded ? ", held until that workspace finishes seeding" : ""
		}`,
	);
	ctx.notify();
	return id;
}
