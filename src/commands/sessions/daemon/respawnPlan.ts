import { resolveHarness } from "../../../shared/harnessLabel";
import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { interactiveHarnessRespawn } from "./interactiveHarnessRespawn";
import type { RespawnPlan } from "./interactiveRespawnPlan";
import { spawnPty } from "./spawnPty";

export function respawnPlan(session: Session): RespawnPlan | null {
	const { commandType, claudeSessionId, cwd, assistArgs } = session;
	if (commandType === "claude") return interactiveHarnessRespawn(session);
	if (commandType === "assist" && assistArgs) {
		const idle = session.status === "waiting";
		return {
			spawn: () =>
				spawnPty(
					assistResumeArgs({
						assistArgs,
						claudeSessionId:
							resolveHarness(session.harness) === "claude"
								? claudeSessionId
								: undefined,
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
