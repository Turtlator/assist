import Box from "@mui/material/Box";
import { useRef } from "react";
import { SessionActionButtons } from "./SessionActionButtons";
import { SessionTopBarCaptions } from "./SessionTopBarCaptions";
import { SessionTopBarDismiss } from "./SessionTopBarDismiss";
import { SessionTopBarElapsed } from "./SessionTopBarElapsed";
import { SessionTopBarToggles } from "./SessionTopBarToggles";
import type { SessionInfo } from "./types";
import { useElementWidth } from "./useElementWidth";
import { LabelledActionsContext } from "./useLabelledActionsContext";

const barSx = {
	position: "sticky",
	top: 0,
	zIndex: 1,
	display: "flex",
	alignItems: "center",
	gap: 1,
	px: 1.5,
	py: 0.75,
	borderBottom: 1,
	borderColor: "divider",
	bgcolor: "background.paper",
	overflow: "hidden",
} as const;

const labelledMinWidth = 560;

export function SessionTopBar({
	session,
	onRetry,
	onRestart,
	onDismiss,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const barRef = useRef<HTMLDivElement>(null);
	const width = useElementWidth(barRef);
	const labelled = width === null || width >= labelledMinWidth;

	return (
		<Box ref={barRef} sx={barSx}>
			<SessionTopBarCaptions session={session} />
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
