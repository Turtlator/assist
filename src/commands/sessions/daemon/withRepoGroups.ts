import type { HistoricalSession } from "../shared/parseSessionFile";
import type { RepoGroup } from "../shared/RepoGroup";
import { repoDirExists } from "./repoDirExists";
import { repoGroupForCwd } from "./repoGroupForCwd";

type GroupedHistoricalSession = HistoricalSession & {
	repoGroup?: RepoGroup;
	cwdMissing?: boolean;
};

export function withRepoGroups(
	sessions: HistoricalSession[],
): GroupedHistoricalSession[] {
	const existence = new Map<string, boolean>();
	const exists = (dir: string): boolean => {
		const cached = existence.get(dir);
		if (cached !== undefined) return cached;
		const result = repoDirExists(dir);
		existence.set(dir, result);
		return result;
	};

	return sessions.map((session) => {
		const repoGroup = repoGroupForCwd(session.cwd);
		const dir = repoGroup?.clone || session.cwd;
		const cwdMissing = Boolean(dir) && !exists(dir);
		if (!repoGroup && !cwdMissing) return session;
		return {
			...session,
			...(repoGroup && { repoGroup }),
			...(cwdMissing && { cwdMissing }),
		};
	});
}
