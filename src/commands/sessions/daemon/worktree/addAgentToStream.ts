import type { HarnessKind } from "../../../../shared/harnesses";
import { daemonLog } from "../daemonLog";
import { joinableStream } from "./joinableStream";
import type { TreeSpawnContext } from "./spawnInTree";
import { spawnIntoStream } from "./spawnIntoStream";

export function addAgentToStream(
	ctx: TreeSpawnContext,
	targetId: string,
	prompt: string | undefined,
	harness: HarnessKind | undefined,
): { sessionId: string } | { reason: string } {
	const joinable = joinableStream(ctx.sessions, targetId);
	if ("reason" in joinable) {
		daemonLog(
			`create: cannot add an agent to session ${targetId}: ${joinable.reason}`,
		);
		return joinable;
	}
	return {
		sessionId: spawnIntoStream(ctx, joinable.session, prompt, harness),
	};
}
