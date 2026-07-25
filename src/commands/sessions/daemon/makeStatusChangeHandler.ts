import { applyStatusChange } from "./applyStatusChange";
import type { Session } from "./createSession";
import { otherTreeHolders } from "./worktree/otherTreeHolders";

export function makeStatusChangeHandler(
	sessions: Map<string, Session>,
	dismiss: (id: string) => void,
	notify: () => void,
	reuseForRun: (session: Session, itemId: number) => void,
) {
	return (s: Session, status: Session["status"], exitCode?: number) =>
		applyStatusChange(
			s,
			status,
			exitCode,
			dismiss,
			notify,
			reuseForRun,
			(session) => otherTreeHolders(sessions, session).length > 0,
		);
}
