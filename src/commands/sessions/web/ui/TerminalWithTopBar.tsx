import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { sessionActionHandlers } from "./sessionActionHandlers";
import { SessionTopBar } from "./SessionTopBar";
import type { SessionInfo, SessionListHandlers } from "./types";

export function TerminalWithTopBar({
	session,
	lifecycle,
	panes,
}: {
	session: SessionInfo;
	lifecycle: SessionListHandlers;
	panes: ReactNode;
}) {
	return (
		<Box
			sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}
		>
			<SessionTopBar
				key={session.id}
				session={session}
				{...sessionActionHandlers(session, lifecycle)}
				onSetAutoRun={(enabled) => lifecycle.onSetAutoRun(session.id, enabled)}
				onSetAutoAdvance={(enabled) =>
					lifecycle.onSetAutoAdvance(session.id, enabled)
				}
			/>
			{panes}
		</Box>
	);
}
