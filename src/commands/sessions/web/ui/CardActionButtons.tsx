import { AddAgentButton } from "./AddAgentButton";
import { backlogTarget } from "./backlogTarget";
import { CardCloseActions } from "./CardCloseActions";
import { CardPrActions } from "./CardPrActions";
import { CompleteButton } from "./CompleteButton";
import { OpenInCodeButton } from "./OpenInCodeButton";
import { RestartButton } from "./RestartButton";
import { RetryButton } from "./RetryButton";
import { ServerRunControls } from "./ServerRunControls";
import { SessionStarButton } from "./SessionStarButton";
import { StopCardActivation } from "./StopCardActivation";
import type { CardHeaderProps } from "./types";

export function CardActionButtons({
	session,
	onRetry,
	onRestart,
	onDismiss,
}: CardHeaderProps) {
	const stopped = session.status === "stopped" || session.closing === true;
	const target = backlogTarget(session);
	return (
		<StopCardActivation>
			<ServerRunControls session={session} />
			<AddAgentButton session={session} />
			{session.cwd && <OpenInCodeButton cwd={session.cwd} variant="card" />}
			<CardPrActions session={session} />
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
