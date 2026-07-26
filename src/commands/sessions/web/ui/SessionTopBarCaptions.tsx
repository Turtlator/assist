import Typography from "@mui/material/Typography";
import { sessionPhaseCaption } from "./sessionPhaseCaption";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

const phaseSx = {
	color: "text.secondary",
	flex: 1,
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function SessionTopBarCaptions({ session }: { session: SessionInfo }) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);
	const { restored } = session;

	return (
		<>
			<Typography variant="caption" sx={phaseSx}>
				{sessionPhaseCaption(session)}
			</Typography>
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{ color: restored ? "success.main" : "warning.main" }}
				>
					{restored ? "restored" : "not restored"}
				</Typography>
			)}
			<Typography variant="caption" color="text.disabled">
				{elapsed}
			</Typography>
		</>
	);
}
