import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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

export function SessionTopBarIds({ session }: { session: SessionInfo }) {
	const { id, claudeSessionId } = session;
	return (
		<Box sx={rowSx}>
			<Typography
				sx={{ ...idSx, flexShrink: 0 }}
				title={`assist session ${id}`}
			>
				{`#${id}`}
			</Typography>
			{claudeSessionId && (
				<Typography
					sx={{
						...idSx,
						minWidth: 0,
						overflow: "hidden",
						textOverflow: "ellipsis",
					}}
					title={`Claude Code conversation ${claudeSessionId}`}
				>
					{claudeSessionId}
				</Typography>
			)}
		</Box>
	);
}
