import { useCallback } from "react";
import { nextWaitingSessionId } from "./nextWaitingSessionId";
import { scrollSessionCardIntoView } from "./scrollSessionCardIntoView";
import type { SessionInfo, SidebarTab } from "./types";
import { useNextWaitingHotkey } from "./useNextWaitingHotkey";
import { useStarredSessions } from "./useStarredSessions";
import { visibleSessionOrder } from "./visibleSessionOrder";

export function useJumpToNextWaiting({
	sessions,
	activeId,
	tab,
	onSelect,
	onTabChange,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	tab: SidebarTab;
	onSelect: (id: string) => void;
	onTabChange: (tab: SidebarTab) => void;
}): void {
	const { isStarred } = useStarredSessions();
	useNextWaitingHotkey(
		useCallback(() => {
			const id = nextWaitingSessionId(
				visibleSessionOrder(sessions, isStarred),
				activeId,
			);
			if (!id) return;
			if (tab !== "active") onTabChange("active");
			onSelect(id);
			scrollSessionCardIntoView(id);
		}, [sessions, isStarred, activeId, tab, onSelect, onTabChange]),
	);
}
