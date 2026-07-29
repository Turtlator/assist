import type { HarnessKind } from "../../../../shared/harnesses";
import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import { createSession } from "../createSession";
import { isDraftCommand } from "../../shared/isDraftCommand";
import { resumeSession } from "../resumeSession";
import { allocateAndBind, type TreeSpawnContext } from "./allocateAndBind";
import { bindResumedWorktree } from "./bindNewWorktree";
import { isCommittingArgs } from "./isCommittingArgs";
import { isPrCheckoutArgs } from "./isPrCheckoutArgs";

export type { TreeSpawnContext };

export function spawnInTree(
	ctx: TreeSpawnContext,
	prompt: string | undefined,
	cwd: string | undefined,
	design: boolean | undefined,
	harness: HarnessKind | undefined,
	inPlace?: boolean,
): string {
	return allocateAndBind(
		ctx,
		cwd,
		(sid, resolvedCwd, holdUntilSeeded) =>
			createSession(sid, prompt, resolvedCwd, design, harness, holdUntilSeeded),
		{ inPlace },
	);
}

export function spawnAssistInTree(
	ctx: TreeSpawnContext,
	assistArgs: string[],
	cwd: string | undefined,
	meta: AssistSessionMeta | undefined,
): string {
	return allocateAndBind(
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
	);
}

export function resumeInTree(
	ctx: TreeSpawnContext,
	sessionId: string,
	cwd: string,
	name: string | undefined,
): string {
	const id = ctx.spawnWith((sid) => resumeSession(sid, sessionId, cwd, name));
	bindResumedWorktree(ctx.sessions.get(id), cwd, ctx.notify);
	return id;
}
