import {
	loadPersistedSessions,
	savePersistedSessions,
} from "./loadPersistedSessions";

export function clearPersistedSessionsOnDrain(): void {
	const held = loadPersistedSessions().filter((s) => s.status === "stopped");
	savePersistedSessions(held);
	console.log(
		held.length > 0
			? `Sessions daemon is not running; cleared persisted sessions (kept ${held.length} stopped session(s) holding unpushed work)`
			: "Sessions daemon is not running; cleared persisted sessions",
	);
}
