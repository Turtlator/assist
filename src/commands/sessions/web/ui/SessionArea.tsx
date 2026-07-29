import Box from "@mui/material/Box";
import { ActiveSessionTopBar } from "./ActiveSessionTopBar";
import {
	type SendPrDecision,
	SessionPreviewSplit,
} from "./SessionPreviewSplit";
import { SessionDiffSplit } from "./SessionDiffSplit";
import { TerminalArea, type TerminalAreaProps } from "./TerminalArea";
import { TranscriptArea } from "./TranscriptArea";
import type { SessionListHandlers, Transcript } from "./types";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

const areaSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
} as const;

export function SessionArea({
	viewingTranscriptSessionId,
	transcript,
	sendPrDecision,
	lifecycle,
	...terminal
}: TerminalAreaProps & {
	viewingTranscriptSessionId: string | null;
	transcript: Transcript | null;
	sendPrDecision: SendPrDecision;
	lifecycle: SessionListHandlers;
}) {
	const topBar = useTopBarLayoutContext();

	if (viewingTranscriptSessionId !== null)
		return (
			<TranscriptArea
				sessionId={viewingTranscriptSessionId}
				transcript={transcript}
			/>
		);

	const activeSession = terminal.sessions.find(
		(s) => s.id === terminal.activeId,
	);

	return (
		<Box sx={areaSx}>
			{topBar && activeSession !== undefined && (
				<ActiveSessionTopBar session={activeSession} lifecycle={lifecycle} />
			)}
			<SessionDiffSplit
				sessionId={terminal.activeId}
				sessions={terminal.sessions}
				sendInput={terminal.sendInput}
			>
				<SessionPreviewSplit
					session={activeSession}
					sendPrDecision={sendPrDecision}
				>
					<TerminalArea {...terminal} />
				</SessionPreviewSplit>
			</SessionDiffSplit>
		</Box>
	);
}
