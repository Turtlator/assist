import type { HarnessKind } from "../../../../shared/harnesses";
import {
	type AssistSessionMeta,
	createAssistSession,
} from "../createAssistSession";
import { createSession, type Session } from "../createSession";
import { resumeSession } from "../resumeSession";
import { allocateTree } from "./allocateTree";
import { bindNewWorktree, bindResumedWorktree } from "./bindNewWorktree";
import { boundTreeRoots } from "./boundTreeRoots";

export type TreeSpawnContext = {
	sessions: Map<string, Session>;
	spawnWith: (create: (id: string) => Session) => string;
	notify: () => void;
	startHeld: (session: Session) => void;
};

function allocateAndBind(
	ctx: TreeSpawnContext,
	cwd: string | undefined,
	create: (
		id: string,
		resolvedCwd: string | undefined,
		holdUntilSeeded: boolean,
	) => Session,
): string {
	const alloc = allocateTree(cwd, boundTreeRoots(ctx.sessions));
	const needsSeeding = alloc.kind === "worktree" && alloc.created === true;
	const id = ctx.spawnWith((sid) => create(sid, alloc.cwd, needsSeeding));
	bindNewWorktree(ctx.sessions.get(id), alloc, ctx.notify, ctx.startHeld);
	return id;
}

export function spawnInTree(
	ctx: TreeSpawnContext,
	prompt: string | undefined,
	cwd: string | undefined,
	design: boolean | undefined,
	harness: HarnessKind | undefined,
): string {
	return allocateAndBind(ctx, cwd, (sid, resolvedCwd, holdUntilSeeded) =>
		createSession(sid, prompt, resolvedCwd, design, harness, holdUntilSeeded),
	);
}

export function spawnAssistInTree(
	ctx: TreeSpawnContext,
	assistArgs: string[],
	cwd: string | undefined,
	meta: AssistSessionMeta | undefined,
): string {
	return allocateAndBind(ctx, cwd, (sid, resolvedCwd, holdUntilSeeded) =>
		createAssistSession(sid, assistArgs, resolvedCwd, meta, holdUntilSeeded),
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
