import { daemonLog } from "./daemonLog";
import { describePersistedSession } from "./describePersistedSession";
import type { PersistedSession } from "./loadPersistedSessions";
import { underTempRoot } from "./worktree/underTempRoot";

export function dropTempRootedSessions(
	persisted: PersistedSession[],
): PersistedSession[] {
	return persisted.filter((entry) => {
		if (!underTempRoot(entry.cwd)) return true;
		daemonLog(
			`persisted session ${describePersistedSession(entry)} lies outside any project root; dropped rather than restored`,
		);
		return false;
	});
}
