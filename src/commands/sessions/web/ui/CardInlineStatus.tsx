import Box from "@mui/material/Box";
import { GitStatusCounts } from "./GitStatusCounts";
import { SessionMetaCaptions } from "./SessionMetaCaptions";
import type { SessionInfo } from "./types";

export function CardInlineStatus({ session }: { session: SessionInfo }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
			<SessionMetaCaptions
				usedPct={session.usedPct}
				undurable={session.undurable}
			/>
			{session.cwd && (
				<GitStatusCounts
					panelSessionId={session.id}
					cwd={session.cwd}
					sessionId={session.claudeSessionId}
				/>
			)}
		</Box>
	);
}
