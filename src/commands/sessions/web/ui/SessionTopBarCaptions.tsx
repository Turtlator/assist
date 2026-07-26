import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { sessionPhaseCaption } from "./sessionPhaseCaption";
import { SessionTopBarIds } from "./SessionTopBarIds";
import { sessionTitle } from "./sessionTitle";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

const groupSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	flex: 1,
	minWidth: 0,
	overflow: "hidden",
} as const;

const asideSx = { flexShrink: 0, whiteSpace: "nowrap" } as const;

const clampSx = {
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function SessionTopBarCaptions({ session }: { session: SessionInfo }) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);
	const { restored } = session;
	const caption = sessionPhaseCaption(session);

	return (
		<>
			<Box sx={groupSx}>
				<Typography variant="body2" sx={{ ...clampSx, color: "text.primary" }}>
					{sessionTitle(session)}
				</Typography>
				{caption && (
					<Typography
						variant="caption"
						sx={{ ...clampSx, flexShrink: 2, color: "text.secondary" }}
					>
						{caption}
					</Typography>
				)}
				<SessionTopBarIds session={session} />
			</Box>
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{
						...asideSx,
						color: restored ? "success.main" : "warning.main",
					}}
				>
					{restored ? "restored" : "not restored"}
				</Typography>
			)}
			<Typography variant="caption" sx={{ ...asideSx, color: "text.disabled" }}>
				{elapsed}
			</Typography>
		</>
	);
}
