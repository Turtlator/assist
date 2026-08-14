import type { HarnessKind } from "../../../../shared/harnesses";
import { createSession, type Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { TreeSpawnContext } from "./spawnInTree";

export type AddAgentRequest = {
	prompt?: string;
	harness?: HarnessKind;
	auto?: boolean;
};

export function spawnIntoStream(
	ctx: TreeSpawnContext,
	target: Session,
	{ prompt, harness, auto }: AddAgentRequest,
): string {
	const holdUntilSeeded = target.pendingStart !== undefined;
	const id = ctx.spawnWith(
		(sid) =>
			createSession(sid, {
				prompt,
				cwd: target.cwd,
				auto,
				harness,
				holdPty: holdUntilSeeded,
			}),
		{ launchedFrom: target.id },
	);
	const joined = ctx.sessions.get(id);
	if (joined && target.worktree) joined.worktree = { ...target.worktree };
	daemonLog(
		`session ${id} added to the stream of session ${target.id} in ${target.cwd}: no workspace allocated${
			auto ? ", in auto mode" : ""
		}${holdUntilSeeded ? ", held until that workspace finishes seeding" : ""}`,
	);
	ctx.notify();
	return id;
}
