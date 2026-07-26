import type { CommitRef } from "../../../shared/db/listCommitRefs";
import { includesCommittedChanges } from "./includesCommittedChanges";
import { itemCommits } from "./itemCommits";

export async function itemScopeCommits(
	cwd: string,
	sessionId?: string,
): Promise<CommitRef[]> {
	if (!sessionId || !includesCommittedChanges(cwd)) return [];
	return itemCommits(sessionId);
}
