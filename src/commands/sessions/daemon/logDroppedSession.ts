import { daemonLog } from "./daemonLog";
import { describePersistedSession } from "./describePersistedSession";
import type { PersistedSession } from "./loadPersistedSessions";

export function logDroppedSession(
	persisted: PersistedSession,
	error: unknown,
): void {
	const reason = error instanceof Error ? error.message : String(error);
	daemonLog(
		`dropped persisted session ${describePersistedSession(persisted)}: ${reason}`,
	);
}
