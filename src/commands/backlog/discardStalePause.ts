import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { clearPause, isPausePending } from "./consumePause";

export function discardStalePause(itemId: number): void {
	if (!isPausePending(itemId)) return;
	clearPause(itemId);
	appendDaemonLog(
		`backlog run ${itemId}: discarded stale pause file at run start; ` +
			`this run starts auto-advancing (Continue on) regardless of a prior run's pause`,
	);
}
