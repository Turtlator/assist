import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function shutdownSessions(sessions: Map<string, Session>): void {
	daemonLog(`shutting down: killing ${sessions.size} session(s)`);
	let failures = 0;
	for (const session of sessions.values()) {
		if (session.status === "done") continue;
		try {
			session.pty?.kill();
		} catch (error) {
			failures++;
			const reason = error instanceof Error ? error.message : String(error);
			daemonLog(
				`shutting down: killing session ${session.name} (${session.id}) failed: ${reason}`,
			);
		}
	}
	if (failures > 0)
		daemonLog(
			`shutting down: ${failures} session(s) failed to die; continuing so the process still exits and releases its listeners`,
		);
}
