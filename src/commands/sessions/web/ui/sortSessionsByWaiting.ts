import type { SessionInfo } from "./types";

const FLOAT_WAITING_AFTER_MS = 5000;

export function hasWaitedPastThreshold(
	session: SessionInfo,
	now: number,
): boolean {
	return (
		session.status === "waiting" &&
		session.waitingSince != null &&
		now - session.waitingSince >= FLOAT_WAITING_AFTER_MS
	);
}

export function sortSessionsByWaiting(
	sessions: SessionInfo[],
	isStarred: (session: SessionInfo) => boolean,
	now: number = Date.now(),
): SessionInfo[] {
	const unstarred = sessions.filter((s) => !isStarred(s));
	const longestWaitingFirst = unstarred
		.filter((s) => hasWaitedPastThreshold(s, now))
		.sort((a, b) => (a.waitingSince ?? 0) - (b.waitingSince ?? 0));
	return [
		...sessions.filter((s) => isStarred(s)),
		...longestWaitingFirst,
		...unstarred.filter((s) => !hasWaitedPastThreshold(s, now)),
	];
}
