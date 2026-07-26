import { isSessionStarting } from "./isSessionStarting";
import { TerminalPanes } from "./TerminalPanes";
import { TerminalWithTopBar } from "./TerminalWithTopBar";
import type { SessionInfo, SessionListHandlers } from "./types";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

type OutputSubscriber = (
	sessionId: string,
	handler: (data: string) => void,
) => () => void;

export type TerminalAreaProps = {
	sessions: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onOutput: OutputSubscriber;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: (sessionId: string, cols: number, rows: number) => void;
	lifecycle: SessionListHandlers;
};

export function TerminalArea({
	sessions,
	activeId,
	initialized,
	onOutput,
	sendInput,
	sendResize,
	lifecycle,
}: TerminalAreaProps) {
	// why: a new session's terminal is empty until its process emits output, so the previously active pane would otherwise show through
	const activeSession = sessions.find((s) => s.id === activeId);
	const activeLoading =
		activeSession !== undefined &&
		isSessionStarting(activeSession, initialized);
	const topBar = useTopBarLayoutContext();

	const panes = (
		<TerminalPanes
			sessions={sessions}
			activeId={activeId}
			activeLoading={activeLoading}
			onOutput={onOutput}
			sendInput={sendInput}
			sendResize={sendResize}
		/>
	);

	if (!topBar || activeSession === undefined) return panes;

	return (
		<TerminalWithTopBar
			session={activeSession}
			lifecycle={lifecycle}
			panes={panes}
		/>
	);
}
