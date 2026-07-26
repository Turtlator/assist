import Chip from "@mui/material/Chip";
import { JiraKeyLink } from "../../../backlog/web/ui/components/JiraKeyLink";
import { ActivityChips } from "./ActivityChips";
import { CloneBadge } from "./CloneBadge";
import { HarnessBadge } from "./HarnessBadge";
import { isRepoScoped } from "./isRepoScoped";
import { isWindowsCwd } from "./isWindowsCwd";
import { repoLabel } from "./repoLabel";
import { ServingChip } from "./ServingChip";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";
import { useCloneBadgeContext } from "./useCloneBadgeContext";
import { useInRepoGroupContext } from "./useInRepoGroupContext";
import { useJiraKeys } from "./useJiraKeys";
import { useTopBarLayoutContext } from "./useTopBarLayoutContext";
import { WindowsBadge } from "./WindowsBadge";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function CardChips({ session }: { session: SessionInfo }) {
	const topBar = useTopBarLayoutContext();
	const grouped = useInRepoGroupContext();
	const named = topBar && grouped;
	const repo =
		!named && isRepoScoped(sessionType(session)) ? repoLabel(session.cwd) : "";
	const jiraKeyFor = useJiraKeys(session.cwd);
	const badgeClone = useCloneBadgeContext().has(session.id);
	const clone = session.repoGroup?.clone;
	return (
		<>
			{repo && <Chip label={repo} size="small" sx={chipSx} />}
			<ServingChip session={session} />
			<HarnessBadge harness={session.harness} />
			{badgeClone && clone && <CloneBadge clone={clone} />}
			{isWindowsCwd(session.cwd) && <WindowsBadge />}
			<ActivityChips session={session} />
			<JiraKeyLink
				variant="chip"
				jiraKey={jiraKeyFor(session.activity?.itemId)}
			/>
		</>
	);
}
