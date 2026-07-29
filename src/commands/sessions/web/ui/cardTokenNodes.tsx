import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { ItemTrackerLink } from "../../../backlog/web/ui/components/ItemTrackerLink";
import type { ItemTracker } from "../../../backlog/web/ui/types";
import { BacklogItemLink } from "./BacklogItemLink";
import { isRepoScoped } from "./isRepoScoped";
import { repoLabel } from "./repoLabel";
import { sessionType } from "./sessionType";
import type { SessionInfo } from "./types";

type CardToken = { key: string; node: ReactNode };

const repoSx = { color: "text.secondary", whiteSpace: "nowrap" } as const;

export function cardTokenNodes(
	session: SessionInfo,
	named: boolean,
	tracker?: ItemTracker,
): CardToken[] {
	const tokens: CardToken[] = [];
	const type = sessionType(session);
	const repo = !named && isRepoScoped(type) ? repoLabel(session.cwd) : "";
	const { activity } = session;

	if (repo)
		tokens.push({
			key: "repo",
			node: (
				<Box component="span" sx={repoSx}>
					{repo}
				</Box>
			),
		});

	if (activity?.kind === "backlog") {
		if (activity.phase !== activity.totalPhases)
			tokens.push({
				key: "phase",
				node: `${activity.phase}/${activity.totalPhases}`,
			});
	} else {
		tokens.push({ key: "type", node: type });
	}

	if (activity?.itemId != null)
		tokens.push({
			key: "item",
			node: <BacklogItemLink itemId={activity.itemId} cwd={session.cwd} />,
		});

	if (tracker)
		tokens.push({
			key: "tracker",
			node: <ItemTrackerLink tracker={tracker} variant="token" />,
		});

	return tokens;
}
