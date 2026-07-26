import { and, asc, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { itemGitRefs } from "./schema";

export type CommitRef = { sha: string; title?: string; url?: string };

export async function listCommitRefs(
	db: Db,
	itemId: number,
): Promise<CommitRef[]> {
	const rows = await db
		.select({
			ref: itemGitRefs.ref,
			title: itemGitRefs.title,
			url: itemGitRefs.url,
		})
		.from(itemGitRefs)
		.where(and(eq(itemGitRefs.itemId, itemId), eq(itemGitRefs.kind, "commit")))
		.orderBy(asc(itemGitRefs.createdAt), asc(itemGitRefs.ref));

	return rows.map((row) => ({
		sha: row.ref,
		...(row.title ? { title: row.title } : {}),
		...(row.url ? { url: row.url } : {}),
	}));
}
