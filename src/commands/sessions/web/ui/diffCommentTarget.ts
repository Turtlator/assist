import type { SessionInfo } from "./types";

type DiffCommentTarget =
	| { session: SessionInfo; unavailable?: undefined }
	| { session?: undefined; unavailable: string };

export function diffCommentTarget(
	sessions: SessionInfo[],
	claudeSessionId: string | undefined,
): DiffCommentTarget {
	if (!claudeSessionId)
		return {
			unavailable: "Open this diff from a session card to comment on it.",
		};
	const session = sessions.find((s) => s.claudeSessionId === claudeSessionId);
	if (!session || session.status === "stopped" || session.closing === true)
		return {
			unavailable: "Comments are unavailable — that session is no longer live.",
		};
	return { session };
}
