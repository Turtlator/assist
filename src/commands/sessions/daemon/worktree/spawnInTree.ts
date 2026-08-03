import { existsSync } from "node:fs";
import type { HarnessKind } from "../../../../shared/harnesses";
import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import { createSession } from "../createSession";
import { daemonLog } from "../daemonLog";
import type { SpawnContext } from "../types";
import { isDraftCommand } from "../../shared/isDraftCommand";
import { resumeSession } from "../resumeSession";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { bindResumedWorktree } from "./bindNewWorktree";
import { ensureWatcher } from "./ensureWatcher";
import { isBacklogRunArgs } from "./isBacklogRunArgs";
import { isCommittingArgs } from "./isCommittingArgs";
import { isPrCheckoutArgs } from "./isPrCheckoutArgs";
import { resumeInReplacementTree } from "./resumeInReplacementTree";

export type { TreeSpawnContext };

export type CreateSpawnRequest = {
	prompt?: string;
	cwd?: string;
	design?: boolean;
	harness?: HarnessKind;
	inPlace?: boolean;
};

export function spawnInTree(
	ctx: TreeSpawnContext,
	{ prompt, cwd, design, harness, inPlace }: CreateSpawnRequest,
	context?: SpawnContext,
): string {
	return allocateAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd, holdUntilSeeded) =>
			createSession(sid, prompt, resolvedCwd, design, harness, holdUntilSeeded),
		{ inPlace },
		context,
	);
}

export function spawnAssistInTree(
	ctx: TreeSpawnContext,
	assistArgs: string[],
	cwd: string | undefined,
	meta: AssistSessionMeta | undefined,
	context?: SpawnContext,
): string {
	const id = allocateAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd, holdUntilSeeded) =>
			createAssistSession(sid, assistArgs, resolvedCwd, meta, holdUntilSeeded),
		{
			forCheckout: isPrCheckoutArgs(assistArgs),
			commits: isCommittingArgs(assistArgs),
			draftLike: isDraftCommand(assistArgs[0]),
			inPlace: meta?.inPlace,
		},
		context,
	);
	if (isBacklogRunArgs(assistArgs)) ensureWatcher(ctx, cwd, id);
	return id;
}

export function resumeInTree(
	ctx: TreeSpawnContext,
	sessionId: string,
	cwd: string,
	name: string | undefined,
): string {
	if (!existsSync(cwd))
		return resumeInReplacementTree(ctx, sessionId, cwd, name);
	const id = ctx.spawnWith((sid) => resumeSession(sid, sessionId, cwd, name));
	daemonLog(`session ${id} resuming ${sessionId} in ${cwd}`);
	bindResumedWorktree(ctx.sessions.get(id), cwd, ctx.notify);
	return id;
}
