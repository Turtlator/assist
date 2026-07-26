import { CardToggles } from "./CardToggles";
import { displayStatus } from "./displayStatus";
import { sessionType } from "./sessionType";
import { StatusRow } from "./StatusRow";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";
import { ViewReviewButton } from "./ViewReviewButton";

export function CardBody({
	session,
	loading,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	loading: boolean;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);
	const topBar = useTopBarLayoutContext();

	if (loading) return null;

	return (
		<>
			{!topBar && (
				<StatusRow
					status={displayStatus(session)}
					elapsed={elapsed}
					cwd={session.cwd}
					sessionId={session.claudeSessionId}
					restored={session.restored}
					usedPct={session.usedPct}
					undurable={session.undurable}
				/>
			)}
			<CardToggles
				session={session}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
			{sessionType(session) === "review" && (
				<ViewReviewButton cwd={session.cwd} />
			)}
		</>
	);
}
