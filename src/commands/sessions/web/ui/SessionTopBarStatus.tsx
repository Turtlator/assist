import Typography from "@mui/material/Typography";
import type { SessionInfo } from "./types";
import { useElapsed } from "./useElapsed";

const asideSx = { flexShrink: 0, whiteSpace: "nowrap" } as const;

export function SessionTopBarStatus({ session }: { session: SessionInfo }) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);
	const { restored } = session;

	return (
		<>
			{restored !== undefined && (
				<Typography
					variant="caption"
					sx={{ ...asideSx, color: restored ? "success.main" : "warning.main" }}
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
