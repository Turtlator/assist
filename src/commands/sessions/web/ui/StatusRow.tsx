import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GitStatusCounts } from "./GitStatusCounts";
import { SessionStatusCaptions } from "./SessionStatusCaptions";
import type { SessionStatus } from "./types";

export function StatusRow({
	status,
	elapsed,
	cwd,
	restored,
	usedPct,
	undurable,
}: {
	status: SessionStatus;
	elapsed: string;
	cwd?: string;
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
				{cwd && <GitStatusCounts cwd={cwd} />}
				<Typography variant="caption" color="text.disabled">
					{elapsed}
				</Typography>
			</Box>
		</Box>
	);
}
