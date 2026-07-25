import { backlogTarget } from "./backlogTarget";
import { CardCloseActions } from "./CardCloseActions";
import { CompleteButton } from "./CompleteButton";
import { OpenInCodeButton } from "./OpenInCodeButton";
import { OpenPrButton } from "./OpenPrButton";
import { RestartButton } from "./RestartButton";
import { ReviewButton } from "./ReviewButton";
import { RetryButton } from "./RetryButton";
import { reviewTargetPr } from "./reviewTargetPr";
import { ServerRunControls } from "./ServerRunControls";
import { SessionStarButton } from "./SessionStarButton";
import { StopCardActivation } from "./StopCardActivation";
import type { CardHeaderProps } from "./types";
import { usePrStatus } from "./usePrStatus";

export function CardActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const { status } = session;
	const stopped = status === "stopped" || session.closing === true;
	const target = backlogTarget(session);
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), status);
	return (
		<StopCardActivation>
			<ServerRunControls session={session} />
			{session.cwd && <OpenInCodeButton cwd={session.cwd} variant="card" />}
			{pr && session.cwd && <OpenPrButton pr={pr} />}
			{pr && session.cwd && <ReviewButton cwd={session.cwd} pr={pr} />}
			{onRestart && !stopped && (
				<RestartButton
					id={session.id}
					onRestart={onRestart}
					harness={session.harness}
				/>
			)}
			{onRetry && <RetryButton id={session.id} onRetry={onRetry} />}
			<SessionStarButton session={session} />
			{target && (
				<CompleteButton
					target={target}
					cwd={session.cwd}
					onDismiss={onDismiss}
				/>
			)}
			<CardCloseActions
				session={session}
				onRestart={onRestart}
				onDismiss={onDismiss}
			/>
		</StopCardActivation>
	);
}
