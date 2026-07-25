import { isSessionStarting } from "./isSessionStarting";
import { SessionCard } from "./SessionCard";
import type { SessionListHandlers } from "./types";
import type { SessionInfo } from "./useSessionSocket";

export function SessionListCard({
	session,
	activeId,
	initialized,
	onSelect,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	activeId: string | null;
	initialized: Set<string>;
	onSelect: (id: string) => void;
} & SessionListHandlers) {
	const retryable = session.commandType === "run" || needsRelaunch(session);
	const restartable = session.commandType !== "run";

	return (
		<SessionCard
			session={session}
			active={session.id === activeId}
			loading={session.closing || isSessionStarting(session, initialized)}
			onClick={() => onSelect(session.id)}
			onRetry={retryable ? () => onRetry(session.id) : undefined}
			onRestart={restartable ? () => onRestart(session.id) : undefined}
			onDismiss={() => onDismiss(session.id)}
			onSetAutoRun={(enabled) => onSetAutoRun(session.id, enabled)}
			onSetAutoAdvance={(enabled) => onSetAutoAdvance(session.id, enabled)}
		/>
	);
}

function needsRelaunch(session: SessionInfo): boolean {
	return (
		session.commandType === "assist" &&
		session.restored === false &&
		!!session.assistArgs
	);
}
