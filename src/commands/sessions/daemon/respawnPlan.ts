import { harnessResumesConversation } from "../../../shared/harnessResumesConversation";
import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import {
	interactiveRespawnPlan,
	type RespawnPlan,
} from "./interactiveRespawnPlan";
import { spawnPty } from "./spawnPty";

export function respawnPlan(session: Session): RespawnPlan | null {
	const { commandType, claudeSessionId, cwd, assistArgs } = session;
	const resumes = harnessResumesConversation(session.harness);
	if (commandType === "claude") return interactiveRespawnPlan(session, resumes);
	if (commandType === "assist" && assistArgs) {
		const idle = session.status === "waiting";
		return {
			spawn: () =>
				spawnPty(
					assistResumeArgs({
						assistArgs,
						claudeSessionId: resumes ? claudeSessionId : undefined,
					}),
					cwd,
					session.id,
					idle ? { ASSIST_RESUME_IDLE: "1" } : undefined,
				),
			status: idle ? "waiting" : "running",
		};
	}
	return null;
}
