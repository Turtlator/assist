import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { sessionPhaseCaption } from "./sessionPhaseCaption";
import { SessionTopBarIds } from "./SessionTopBarIds";
import { SessionTopBarTitle } from "./SessionTopBarTitle";
import type { SessionInfo } from "./types";

const columnSx = {
	display: "flex",
	flexDirection: "column",
	flex: 1,
	minWidth: 0,
	overflow: "hidden",
} as const;

const phaseSx = {
	color: "text.secondary",
	fontSize: "0.7rem",
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function SessionTopBarCaptions({ session }: { session: SessionInfo }) {
	const caption = sessionPhaseCaption(session);

	return (
		<Box sx={columnSx}>
			<SessionTopBarIds session={session} />
			<SessionTopBarTitle session={session} />
			{caption && <Typography sx={phaseSx}>{caption}</Typography>}
		</Box>
	);
}
