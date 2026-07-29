import { BranchDiffLink } from "./BranchDiffLink";
import { GitStatusLink } from "./GitStatusLink";
import { sessionDiffAffordance } from "./sessionDiffAffordance";
import { useGitStatusCounts } from "./useGitStatusCounts";

export function GitStatusCounts({
	panelSessionId,
	cwd,
	sessionId,
	offerBranchDiff = false,
}: {
	panelSessionId: string;
	cwd: string;
	sessionId?: string;
	offerBranchDiff?: boolean;
}) {
	const affordance = sessionDiffAffordance(useGitStatusCounts(cwd, sessionId));
	if (!affordance) return null;

	if (affordance.kind === "branch")
		return offerBranchDiff ? (
			<BranchDiffLink
				panelSessionId={panelSessionId}
				cwd={cwd}
				sessionId={sessionId}
				defaultBranch={affordance.defaultBranch}
			/>
		) : null;

	return (
		<GitStatusLink
			panelSessionId={panelSessionId}
			cwd={cwd}
			sessionId={sessionId}
			groups={affordance.groups}
			uncommitted={affordance.uncommitted}
		/>
	);
}
