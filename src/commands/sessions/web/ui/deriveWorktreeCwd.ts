import { findActiveSession } from "./findActiveSession";
import { repoGroupCwd } from "./repoGroupKey";
import type { HistoricalSession, SessionInfo } from "./types";

export function deriveWorktreeCwd(
	activeId: string | null,
	sessions: SessionInfo[],
	history: HistoricalSession[],
	selectedCwd: string,
): string {
	const active = findActiveSession(activeId, sessions, history);
	if (!active?.cwd) return selectedCwd;
	return repoGroupCwd(active) === selectedCwd ? active.cwd : selectedCwd;
}
