import Typography from "@mui/material/Typography";
import type { SessionInfo } from "./types";

const idSx = {
	color: "text.disabled",
	fontFamily: "monospace",
	whiteSpace: "nowrap",
	userSelect: "all",
} as const;

const conversationSx = {
	...idSx,
	flexShrink: 3,
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

export function SessionTopBarIds({ session }: { session: SessionInfo }) {
	const { id, claudeSessionId } = session;
	return (
		<>
			<Typography
				variant="caption"
				sx={{ ...idSx, flexShrink: 0 }}
				title={`assist session ${id}`}
			>
				{`#${id}`}
			</Typography>
			{claudeSessionId && (
				<Typography
					variant="caption"
					sx={conversationSx}
					title={`Claude Code conversation ${claudeSessionId}`}
				>
					{claudeSessionId}
				</Typography>
			)}
		</>
	);
}
