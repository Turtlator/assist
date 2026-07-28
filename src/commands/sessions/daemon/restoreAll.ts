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
	const cap = sessionLimits.maxRestore();
	const names = persisted.slice(0, cap).map((entry) => {
		restoreOne(entry, spawner, sessions);
		return entry.name;
	});
	for (const over of persisted.slice(cap))
		deferOne(over, spawner.recoveryCard, cap);
	return names;
}

function deferOne(
	persisted: PersistedSession,
	spawnRecoveryCard: Spawn,
	cap: number,
): void {
	try {
		const id = spawnRecoveryCard((sid) => deferredSession(sid, persisted, cap));
		daemonLog(
			`restore capped at ${cap} (sessions.maxLive): ${describePersistedSession(persisted)} deferred to stopped card ${id}`,
		);
	} catch (error) {
		logDroppedSession(persisted, error);
	}
}
