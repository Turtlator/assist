import type { GitStatusCounts as Counts } from "../parseGitStatus";
import { GitStatusLink, GROUPS } from "./GitStatusLink";
import { useGitStatusCounts } from "./useGitStatusCounts";

function toGroups(counts: Counts) {
	return GROUPS.map((g) => ({ ...g, count: counts[g.key].length })).filter(
		(g) => g.count > 0,
	);
}

export function GitStatusCounts({
	cwd,
	sessionId,
}: {
	cwd: string;
	sessionId?: string;
}) {
	const counts = useGitStatusCounts(cwd, sessionId);
	if (!counts) return null;

	const groups = toGroups(counts);
	const uncommitted =
		counts.hasCommits && counts.uncommitted
			? toGroups(counts.uncommitted)
			: undefined;
	if (groups.length === 0 && (uncommitted?.length ?? 0) === 0) return null;

	return (
		<GitStatusLink
			cwd={cwd}
			sessionId={sessionId}
			groups={groups}
			uncommitted={uncommitted}
		/>
	);
}
