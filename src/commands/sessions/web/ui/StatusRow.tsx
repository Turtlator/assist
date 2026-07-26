import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GitStatusCounts } from "./GitStatusCounts";
import { SessionStatusCaptions } from "./SessionStatusCaptions";
import type { SessionStatus } from "./types";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";

export function StatusRow({
	status,
	elapsed,
	cwd,
	sessionId,
	restored,
	usedPct,
	undurable,
}: {
	status: SessionStatus;
	elapsed: string;
	cwd?: string;
	sessionId?: string;
	restored?: boolean;
	usedPct?: number;
	undurable?: { reason: string };
}) {
	const topBar = useTopBarLayoutContext();
	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
			<SessionStatusCaptions
				status={status}
				restored={restored}
				usedPct={usedPct}
				undurable={undurable}
			/>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				{cwd && <GitStatusCounts cwd={cwd} sessionId={sessionId} />}
				{!topBar && (
					<Typography variant="caption" color="text.disabled">
						{elapsed}
					</Typography>
				)}
			</Box>
		</Box>
	);
}
