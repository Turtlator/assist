import { randomUUID } from "node:crypto";
import type { Session } from "./createSession";
import { spawnClaude } from "./spawnClaude";

export type RespawnPlan = {
	spawn: () => Session["pty"];
	status: Session["status"];
};

export function interactiveRespawnPlan(
	session: Session,
	resumes: boolean,
): RespawnPlan | null {
	const { claudeSessionId, cwd, initialPrompt } = session;
	if (!resumes) return null;
	if (claudeSessionId)
		return {
			spawn: () =>
				spawnClaude({
					resumeSessionId: claudeSessionId,
					cwd,
					sessionId: session.id,
				}),
			status: "waiting",
		};
	if (initialPrompt) return freshClaudePlan(session, initialPrompt, cwd);
	if (cwd) return freshClaudePlan(session, undefined, cwd);
	return null;
}

function freshClaudePlan(
	session: Session,
	prompt: string | undefined,
	cwd: string | undefined,
): RespawnPlan {
	const claudeSessionId = randomUUID();
	return {
		spawn: () => {
			session.claudeSessionId = claudeSessionId;
			return spawnClaude({
				prompt,
				cwd,
				sessionId: session.id,
				claudeSessionId,
			});
		},
		status: prompt ? "running" : "waiting",
	};
}
