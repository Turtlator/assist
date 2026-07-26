import { useCallback, useMemo } from "react";
import { sortSessionsByStar } from "./sortSessionsByStar";
import {
	hasWaitedPastThreshold,
	sortSessionsByWaiting,
} from "./sortSessionsByWaiting";
import type { SessionInfo } from "./types";
import { useSessionViewConfig } from "./useSessionViewConfig";
import { useStarredSessions } from "./useStarredSessions";
import { useWaitingClock } from "./useWaitingClock";

export function useSidebarOrdering(sessions: SessionInfo[]): {
	sessions: SessionInfo[];
	isFloatingWaiter: (session: SessionInfo) => boolean;
} {
	const { isStarred } = useStarredSessions();
	const { floatWaiting } = useSessionViewConfig();
	const now = useWaitingClock(floatWaiting);

	return {
		sessions: useMemo(
			() =>
				floatWaiting
					? sortSessionsByWaiting(sessions, isStarred, now)
					: sortSessionsByStar(sessions, isStarred),
			[sessions, isStarred, floatWaiting, now],
		),
		isFloatingWaiter: useCallback(
			(session: SessionInfo) =>
				floatWaiting && hasWaitedPastThreshold(session, now),
			[floatWaiting, now],
		),
	};
}
