import Box from "@mui/material/Box";
import { SessionActionButtons } from "./SessionActionButtons";
import { SessionTopBarDiff } from "./SessionTopBarDiff";
import { SessionTopBarDismiss } from "./SessionTopBarDismiss";
import { SessionTopBarElapsed } from "./SessionTopBarElapsed";
import { SessionTopBarToggles } from "./SessionTopBarToggles";
import type { SessionControlHandlers, SessionInfo } from "./types";
import { LabelledActionsContext } from "./useLabelledActionsContext";

const controlsSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 1,
	flexGrow: 0,
	flexShrink: 1,
	flexBasis: "auto",
	minWidth: 0,
} as const;

export function SessionTopBarControls({
	session,
	labelled,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	labelled: boolean;
} & SessionControlHandlers) {
	return (
		<Box sx={controlsSx}>
			<SessionTopBarDiff session={session} />
			<SessionTopBarElapsed session={session} />
			<SessionTopBarToggles
				session={session}
				onSetAutoRun={onSetAutoRun}
				onSetAutoAdvance={onSetAutoAdvance}
			/>
			<LabelledActionsContext.Provider value={labelled}>
				<SessionActionButtons
					session={session}
					onRetry={onRetry}
					onRestart={onRestart}
					onDismiss={onDismiss}
				/>
			</LabelledActionsContext.Provider>
			<SessionTopBarDismiss session={session} onDismiss={onDismiss} />
		</Box>
	);
}
