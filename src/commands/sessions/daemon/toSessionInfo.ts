import type { Session, SessionInfo } from "./createSession";
import { repoGroupForCwd } from "./repoGroupForCwd";
import { toSessionRunInfo } from "./toSessionRunInfo";
import { joinRefusal } from "./worktree/joinRefusal";

export function toSessionInfo(session: Session): SessionInfo {
	const {
		id,
		name,
		title,
		generatedTitle,
		subtitle,
		commandType,
		harness,
		cwd,
		launchedFrom,
		claudeSessionId,
		restored,
		autoRun,
		autoAdvance,
		starred,
		watcher,
		design,
		verifying,
		pendingPrPreview,
		undurable,
	} = session;
	return {
		...toSessionRunInfo(session),
		id,
		name,
		title,
		generatedTitle,
		subtitle,
		commandType,
		harness,
		cwd,
		launchedFrom,
		claudeSessionId,
		repoGroup: repoGroupForCwd(cwd),
		restored,
		autoRun,
		autoAdvance,
		starred,
		watcher,
		design,
		verifying,
		pendingPrPreview,
		undurable,
		joinable: joinRefusal(session) === undefined,
	};
}
