import type { Session } from "../createSession";

export function joinableStream(
	sessions: Map<string, Session>,
	targetId: string,
): { session: Session } | { reason: string } {
	const target = sessions.get(targetId);
	if (!target) return { reason: "no such session" };
	if (target.commandType === "run")
		return { reason: "a server run has no agent stream" };
	if (target.closing === true) return { reason: "the session is closing" };
	if (target.status !== "running" && target.status !== "waiting")
		return { reason: `the session is ${target.status}` };
	if (!target.cwd) return { reason: "the session has no working directory" };
	return { session: target };
}
