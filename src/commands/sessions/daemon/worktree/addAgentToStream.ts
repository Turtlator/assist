import { daemonLog } from "../daemonLog";
import { joinableStream } from "./joinableStream";
import type { TreeSpawnContext } from "./spawnInTree";
import { type AddAgentRequest, spawnIntoStream } from "./spawnIntoStream";

export function addAgentToStream(
	ctx: TreeSpawnContext,
	targetId: string,
	request: AddAgentRequest,
): { sessionId: string } | { reason: string } {
	const joinable = joinableStream(ctx.sessions, targetId);
	if ("reason" in joinable) {
		daemonLog(
			`create: cannot add an agent to session ${targetId}: ${joinable.reason}`,
		);
		return joinable;
	}
	return {
		sessionId: spawnIntoStream(ctx, joinable.session, request),
	};
}
