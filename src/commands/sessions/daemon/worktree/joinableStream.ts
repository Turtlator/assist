import type { Session } from "../createSession";
import { joinRefusal } from "./joinRefusal";

export function joinableStream(
	sessions: Map<string, Session>,
	targetId: string,
): { session: Session } | { reason: string } {
	const target = sessions.get(targetId);
	if (!target) return { reason: "no such session" };
	const reason = joinRefusal(target);
	return reason ? { reason } : { session: target };
}
