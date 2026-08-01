import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export class VerifyTracker {
	private readonly sessionByClient = new Map<SessionClient, string>();

	constructor(
		private readonly sessions: Map<string, Session>,
		private readonly notify: () => void,
	) {}

	start(client: SessionClient, sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) {
			daemonLog(
				`verify-started for unknown session id=${sessionId} (ignoring)`,
			);
			return;
		}
		daemonLog(`verify-started received: id=${sessionId}`);
		this.sessionByClient.set(client, sessionId);
		session.verifying = true;
		this.notify();
	}

	clear(client: SessionClient): void {
		const sessionId = this.sessionByClient.get(client);
		if (!sessionId) return;
		this.sessionByClient.delete(client);
		if (this.stillVerifying(sessionId)) return;
		daemonLog(`verify connection closed: id=${sessionId}`);
		const session = this.sessions.get(sessionId);
		if (session) session.verifying = false;
		this.notify();
	}

	private stillVerifying(sessionId: string): boolean {
		return [...this.sessionByClient.values()].includes(sessionId);
	}
}
