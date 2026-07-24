import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { contextColor, statusColors } from "./statusColors";
import type { SessionStatus } from "./types";

export function StatusRow({
	status,
	elapsed,
	restored,
	usedPct,
	undurable,
}: {
	status: SessionStatus;
	elapsed: string;
	restored?: boolean;
	usedPct?: number;
	undurable?: { reason: string };
}) {
	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<Typography variant="caption" sx={{ color: statusColors[status] }}>
					● {status}
				</Typography>
				{undurable && (
					<Typography variant="caption" sx={{ color: "warning.main" }}>
						{undurable.reason}
					</Typography>
				)}
				{restored !== undefined && (
					<Typography
						variant="caption"
						sx={{ color: restored ? "success.main" : "warning.main" }}
					>
						{restored ? "restored" : "not restored"}
					</Typography>
				)}
				{usedPct !== undefined && (
					<Typography
						variant="caption"
						sx={{
							color: contextColor(usedPct),
							opacity: 0.6,
							fontSize: "0.8rem",
						}}
					>
						{Math.round(usedPct)}%
					</Typography>
				)}
			</Box>
			<Typography variant="caption" color="text.disabled">
				{elapsed}
			</Typography>
		</Box>
	);
}
