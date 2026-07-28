import type { SessionClient } from "./broadcast";
import { registerSpawnedSession } from "./registerSpawnedSession";
import { sessionLimits } from "./sessionLimits";
import type { OnStatusChange, Session } from "./types";

type Spawn = (create: (id: string) => Session) => string;

export type SessionSpawner = { spawn: Spawn; recoveryCard: Spawn };

export function makeSessionSpawner(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	counter: { next: number },
	onStatusChange: () => OnStatusChange,
	notify: () => void,
): SessionSpawner {
	const register =
		(allocateId: () => string): Spawn =>
		(create) =>
			registerSpawnedSession(
				create(allocateId()),
				sessions,
				clients,
				onStatusChange(),
				notify,
			);
	return {
		spawn: register(() => sessionLimits.nextId(sessions.size, counter)),
		recoveryCard: register(() => sessionLimits.recoveryCardId(counter)),
	};
}
