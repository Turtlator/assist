import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { isRepoScoped } from "./isRepoScoped";
import { repoLabel } from "./repoLabel";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";

const rowSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	minWidth: 0,
} as const;

const idSx = {
	color: "text.disabled",
	fontFamily: "monospace",
	fontSize: "0.65rem",
	whiteSpace: "nowrap",
	userSelect: "all",
} as const;

const clampSx = {
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

export function SessionTopBarIds({ session }: { session: SessionInfo }) {
	const { id, claudeSessionId } = session;
	const repo = isRepoScoped(sessionType(session)) ? repoLabel(session.cwd) : "";

	return (
		<Box sx={rowSx}>
			{repo && (
				<Typography
					sx={{ ...idSx, ...clampSx, color: "text.secondary" }}
					title={session.cwd}
				>
					{repo}
				</Typography>
			)}
			<Typography
				sx={{ ...idSx, flexShrink: 0 }}
				title={`assist session ${id}`}
			>
				{`#${id}`}
			</Typography>
			{claudeSessionId && (
				<Typography
					sx={{ ...idSx, ...clampSx }}
					title={`Claude Code conversation ${claudeSessionId}`}
				>
					{claudeSessionId}
				</Typography>
			)}
		</Box>
	);
}
