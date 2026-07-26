import Box from "@mui/material/Box";
import { displayStatus } from "./displayStatus";
import { GitStatusCounts } from "./GitStatusCounts";
import { SessionStatusCaptions } from "./SessionStatusCaptions";
import type { SessionInfo } from "./types";

export function CardInlineStatus({ session }: { session: SessionInfo }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
			<SessionStatusCaptions
				status={displayStatus(session)}
				usedPct={session.usedPct}
				undurable={session.undurable}
			/>
			{session.cwd && (
				<GitStatusCounts
					cwd={session.cwd}
					sessionId={session.claudeSessionId}
				/>
			)}
		</Box>
	);
}
