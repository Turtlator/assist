import { removeActivity } from "../../../shared/emitActivity";
import type { Session } from "./createSession";
import { setStatus } from "./setStatus";

export function resetCardForRun(session: Session, assistArgs: string[]): void {
	session.pty?.kill();
	session.gitWatcher?.close();
	session.gitWatcher = undefined;
	session.undurable = undefined;
	session.assistArgs = assistArgs;
	session.name = `assist ${assistArgs.join(" ")}`;
	session.commandType = "assist";
	session.activity = undefined;
	removeActivity(session.id);
	session.scrollback = "";
	session.startedAt = Date.now();
	session.runningMs = 0;
	session.runningSince = null;
	session.usageSeeded = false;
	setStatus(session, "running");
	session.restored = undefined;
}
