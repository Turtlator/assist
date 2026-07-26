import { findItemBySessionId } from "../../../shared/db/findItemBySessionId";
import { getDb } from "../../../shared/db/getDb";
import {
	type CommitRef,
	listCommitRefs,
} from "../../../shared/db/listCommitRefs";
import { loadConfig } from "../../../shared/loadConfig";

export async function itemCommits(sessionId: string): Promise<CommitRef[]> {
	try {
		if (!process.env.ASSIST_DATABASE_URL && !loadConfig().database.url)
			return [];
		const db = await getDb();
		const itemId = await findItemBySessionId(db, sessionId);
		if (itemId === undefined) return [];
		return await listCommitRefs(db, itemId);
	} catch {
		return [];
	}
}
