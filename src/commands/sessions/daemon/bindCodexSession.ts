import { resolveCodexSessionId } from "../shared/codex/resolveCodexSessionId";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

const POLL_MS = 1000;
const MAX_ATTEMPTS = 120;
const START_SLACK_MS = 5000;

export function bindCodexSession(session: Session, notify: () => void): void {
	const cwd = session.cwd;
	if (session.harness !== "codex" || !cwd || session.harnessSessionId) return;

	const since = session.startedAt - START_SLACK_MS;
	let attemptsLeft = MAX_ATTEMPTS;

	const schedule = () => setTimeout(() => void poll(), POLL_MS).unref();
	const poll = async () => {
		if (session.harnessSessionId) return;
		const sessionId = await resolveCodexSessionId(cwd, since);
		if (!sessionId) {
			if (--attemptsLeft > 0) schedule();
			return;
		}
		session.harnessSessionId = sessionId;
		daemonLog(`session ${session.id} bound to codex conversation ${sessionId}`);
		notify();
	};

	schedule();
}
