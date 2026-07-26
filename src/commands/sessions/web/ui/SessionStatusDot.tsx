import Typography from "@mui/material/Typography";
import { statusColors } from "./statusColors";
import type { SessionStatus } from "./types";

export function SessionStatusDot({
	status,
	label = false,
}: {
	status: SessionStatus;
	label?: boolean;
}) {
	if (label)
		return (
			<Typography variant="caption" sx={{ color: statusColors[status] }}>
				● {status}
			</Typography>
		);

	return (
		<Typography
			variant="caption"
			sx={{ color: statusColors[status], flexShrink: 0 }}
			title={status}
		>
			●
		</Typography>
	);
}
