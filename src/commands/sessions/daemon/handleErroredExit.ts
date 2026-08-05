import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { exitDetail, exitReason } from "./exitReason";
import { exitOutputTail } from "./exitOutputTail";
import type { OnStatusChange } from "./types";

export function handleErroredExit(
	session: Session,
	exitCode: number,
	priorStatus: Session["status"],
	onStatusChange: OnStatusChange,
): void {
	const detail = exitDetail(session);
	session.error = exitReason(exitCode, detail);
	const output = exitOutputTail(session.scrollback);
	daemonLog(
		`session ${session.id} ("${session.name}") pty exited with code ${exitCode} from status "${priorStatus}" — unexpected exit, marking error${detail ? `: ${detail}` : ""}${output ? `; output: ${output}` : ""}`,
	);
	onStatusChange(session, "error", exitCode);
}
