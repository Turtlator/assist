import { GitStatusLink, GROUPS } from "./GitStatusLink";
import { useGitStatusCounts } from "./useGitStatusCounts";

export function GitStatusCounts({
	cwd,
	sessionId,
}: {
	cwd: string;
	sessionId?: string;
}) {
	const counts = useGitStatusCounts(cwd, sessionId);

	const groups = counts
		? GROUPS.map((g) => ({ ...g, count: counts[g.key].length })).filter(
				(g) => g.count > 0,
			)
		: [];
	if (!counts || groups.length === 0) return null;

	return <GitStatusLink cwd={cwd} sessionId={sessionId} groups={groups} />;
}
