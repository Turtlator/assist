import type { Session } from "./createSession";
import type { RespawnPlan } from "./interactiveRespawnPlan";
import { spawnCodex } from "./spawnCodex";

export function codexRespawnPlan(session: Session): RespawnPlan | null {
	const { harnessSessionId, cwd, initialPrompt } = session;
	if (harnessSessionId)
		return {
			spawn: () =>
				spawnCodex({
					resumeSessionId: harnessSessionId,
					cwd,
					sessionId: session.id,
				}),
			status: "waiting",
		};
	if (!cwd && !initialPrompt) return null;
	return {
		spawn: () =>
			spawnCodex({ prompt: initialPrompt, cwd, sessionId: session.id }),
		status: initialPrompt ? "running" : "waiting",
	};
}
