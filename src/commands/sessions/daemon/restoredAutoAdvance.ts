import { isPausePending } from "../../backlog/consumePause";
import { daemonLog } from "./daemonLog";
import type { PersistedSession } from "./persistedSessionSchema";

export function restoredAutoAdvance(
	id: string,
	persisted: PersistedSession,
): boolean | undefined {
	const itemId = persisted.activity?.itemId;
	if (itemId == null || !isPausePending(itemId)) return persisted.autoAdvance;
	if (persisted.autoAdvance !== false)
		daemonLog(
			`session ${id} autoadvance forced off on restore: pause pending for backlog item ${itemId}`,
		);
	return false;
}
