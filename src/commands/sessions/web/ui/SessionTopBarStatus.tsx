import Typography from "@mui/material/Typography";
import { displayStatus } from "./displayStatus";
import { SessionStatusDot } from "./SessionStatusDot";
import type { SessionInfo } from "./types";

const asideSx = { flexShrink: 0, whiteSpace: "nowrap" } as const;

export function SessionTopBarStatus({ session }: { session: SessionInfo }) {
	const { restored } = session;

	return (
		<>
			<SessionStatusDot status={displayStatus(session)} label />
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{ ...asideSx, color: restored ? "success.main" : "warning.main" }}
				>
					{restored ? "restored" : "not restored"}
				</Typography>
			)}
		</>
	);
}
