import { useMemo } from "react";
import { Sidebar } from "./Sidebar";
import { sortSessionsByStar } from "./sortSessionsByStar";
import { sortSessionsByWaiting } from "./sortSessionsByWaiting";
import type { SidebarTab } from "./types";
import { useJumpToNextWaiting } from "./useJumpToNextWaiting";
import type { useSessionSocket } from "./useSessionSocket";
import { useSessionViewConfig } from "./useSessionViewConfig";
import { useSidebarNavigation } from "./useSidebarNavigation";
import { useStarredSessions } from "./useStarredSessions";
import { useWaitingClock } from "./useWaitingClock";

type Props = {
	socket: ReturnType<typeof useSessionSocket>;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
};

export function AppSidebar({ socket, tab, onTabChange }: Props) {
	const { isStarred } = useStarredSessions();
	const { floatWaiting } = useSessionViewConfig();
	const now = useWaitingClock(floatWaiting);
	const sessions = useMemo(
		() =>
			floatWaiting
				? sortSessionsByWaiting(socket.sessions, isStarred, now)
				: sortSessionsByStar(socket.sessions, isStarred),
		[socket.sessions, isStarred, floatWaiting, now],
	);
	const { handleSelect, handleResume, handleView } = useSidebarNavigation(
		socket,
		onTabChange,
	);

	useJumpToNextWaiting({
		sessions,
		activeId: socket.activeId,
		tab,
		onSelect: handleSelect,
		onTabChange,
	});

	return (
		<Sidebar
			sessions={sessions}
			pendingLaunches={socket.pendingLaunches}
			history={socket.history}
			activeId={socket.activeId}
			tab={tab}
			onTabChange={onTabChange}
			onSelect={handleSelect}
			onDismissPending={socket.dismissPendingLaunch}
			onView={handleView}
			onResume={handleResume}
			onRetry={socket.retrySession}
			onRestart={socket.restartSession}
			onDismiss={socket.dismissSession}
			onSetAutoRun={socket.setAutoRun}
			onSetAutoAdvance={socket.setAutoAdvance}
			initialized={socket.initialized}
		/>
	);
}
