import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GitStatusCounts } from "./GitStatusCounts";
import { SessionStatusCaptions } from "./SessionStatusCaptions";
import type { SessionStatus } from "./types";

export function StatusRow({
	status,
	elapsed,
	panelSessionId,
	cwd,
	sessionId,
	restored,
	usedPct,
	undurable,
}: {
	status: SessionStatus;
	elapsed: string;
	panelSessionId: string;
	cwd?: string;
	sessionId?: string;
	restored?: boolean;
	usedPct?: number;
	undurable?: { reason: string };
}) {
	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
			<SessionStatusCaptions
				status={status}
				restored={restored}
				usedPct={usedPct}
				undurable={undurable}
			/>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{cwd && (
					<GitStatusCounts
						panelSessionId={panelSessionId}
						cwd={cwd}
						sessionId={sessionId}
					/>
				)}
				<Typography
					variant="caption"
					color="text.disabled"
					sx={{ whiteSpace: "nowrap" }}
				>
					{elapsed}
				</Typography>
			</Box>
		</Box>
	);
}
