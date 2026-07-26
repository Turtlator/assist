import Box from "@mui/material/Box";
import { groupSessionsByRepo } from "./groupSessionsByRepo";
import { NoSessionsMessage } from "./NoSessionsMessage";
import type { PendingLaunch } from "./PendingLaunch";
import { PendingLaunchCard } from "./PendingLaunchCard";
import { SessionGroups } from "./SessionGroups";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";
import { useStarredSessions } from "./useStarredSessions";

const unpaddedScrollportSx = { flex: 1, overflow: "auto" } as const;

const paddedContentSx = { p: 1 } as const;

export function SessionList({
	sessions,
	pendingLaunches,
	activeId,
	initialized,
	onSelect,
	onDismissPending,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	sessions: SessionInfo[];
	pendingLaunches: PendingLaunch[];
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
	onDismissPending: (id: string) => void;
} & SessionListHandlers) {
	const { isStarred } = useStarredSessions();
	const groups = groupSessionsByRepo(sessions, isStarred);

	return (
		<Box sx={unpaddedScrollportSx}>
			<Box sx={paddedContentSx}>
				{pendingLaunches.map((launch) => (
					<PendingLaunchCard
						key={launch.id}
						launch={launch}
						onDismiss={onDismissPending}
					/>
				))}
				<SessionGroups
					groups={groups}
					activeId={activeId}
					initialized={initialized}
					onSelect={onSelect}
					onRetry={onRetry}
					onRestart={onRestart}
					onDismiss={onDismiss}
					onSetAutoRun={onSetAutoRun}
					onSetAutoAdvance={onSetAutoAdvance}
				/>
				{sessions.length === 0 && pendingLaunches.length === 0 && (
					<NoSessionsMessage />
				)}
			</Box>
		</Box>
	);
}
