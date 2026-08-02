import Typography from "@mui/material/Typography";
import { isRepoScoped } from "./isRepoScoped";
import { repoLabel } from "./repoLabel";
import { SessionTopBarConversationId } from "./SessionTopBarConversationId";
import { sessionType } from "./sessionType";
import { topBarIdSx } from "./topBarIdSx";
import type { SessionInfo } from "./types";

export function SessionTopBarIds({
	session,
	collapsed,
}: {
	session: SessionInfo;
	collapsed: boolean;
}) {
	const { id, claudeSessionId } = session;
	const repo = isRepoScoped(sessionType(session)) ? repoLabel(session.cwd) : "";

	return (
		<>
			{repo && (
				<Typography
					sx={{ ...topBarIdSx, color: "text.secondary" }}
					title={session.cwd}
				>
					{repo}
				</Typography>
			)}
			<Typography
				sx={{ ...topBarIdSx, userSelect: "all" }}
				title={`assist session ${id}`}
			>
				{`#${id}`}
			</Typography>
			{claudeSessionId && (
				<SessionTopBarConversationId
					conversationId={claudeSessionId}
					collapsed={collapsed}
				/>
			)}
		</>
	);
}
