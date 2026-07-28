import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { deferredSession } from "./deferredSession";
import { describePersistedSession } from "./describePersistedSession";
import {
	loadPersistedSessions,
	type PersistedSession,
} from "./loadPersistedSessions";
import { logDroppedSession } from "./logDroppedSession";
import type { SessionSpawner } from "./makeSessionSpawner";
import { restoreOne, type Spawn } from "./restoreOne";
import { sessionLimits } from "./sessionLimits";

export function restoreAll(
	spawner: SessionSpawner,
	sessions: Map<string, Session>,
): string[] {
	const persisted = loadPersistedSessions();
	const names = persisted.slice(0, sessionLimits.maxRestore).map((entry) => {
		restoreOne(entry, spawner, sessions);
		return entry.name;
	});
	for (const over of persisted.slice(sessionLimits.maxRestore))
		deferOne(over, spawner.recoveryCard);
	return names;
}

function deferOne(persisted: PersistedSession, spawnRecoveryCard: Spawn): void {
	try {
		const id = spawnRecoveryCard((sid) =>
			deferredSession(sid, persisted, sessionLimits.maxRestore),
		);
		daemonLog(
			`restore capped at ${sessionLimits.maxRestore}: ${describePersistedSession(persisted)} deferred to stopped card ${id}`,
		);
	} catch (error) {
		logDroppedSession(persisted, error);
	}
}
