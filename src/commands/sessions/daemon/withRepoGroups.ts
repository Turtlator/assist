import type { HistoricalSession } from "../shared/parseSessionFile";
import type { RepoGroup } from "../shared/RepoGroup";
import { repoGroupForCwd } from "./repoGroupForCwd";

type GroupedHistoricalSession = HistoricalSession & {
	repoGroup?: RepoGroup;
};

export function withRepoGroups(
	sessions: HistoricalSession[],
): GroupedHistoricalSession[] {
	return sessions.map((session) => {
		const repoGroup = repoGroupForCwd(session.cwd);
		return repoGroup ? { ...session, repoGroup } : session;
	});
}
