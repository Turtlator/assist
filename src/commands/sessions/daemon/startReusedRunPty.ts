import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { refuseSpawn } from "./refuseSpawn";
import { spawnPty } from "./spawnPty";
import { startOrHoldPty } from "./startOrHoldPty";
import type { OnStatusChange } from "./types";

export function startReusedRunPty(
	session: Session,
	assistArgs: string[],
	itemId: number,
	hold: boolean,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): boolean {
	try {
		Object.assign(
			session,
			startOrHoldPty(
				() => spawnPty(["assist", ...assistArgs], session.cwd, session.id),
				hold,
			),
		);
	} catch (error) {
		refuseSpawn(
			session,
			error,
			clients,
			onStatusChange,
			`reused for backlog run ${itemId}`,
		);
		return false;
	}
	return true;
}
