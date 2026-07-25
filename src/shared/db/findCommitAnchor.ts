import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db } from "./Db";
import { itemGitRefs } from "./schema";

export type CommitAnchor = { commit?: string; parent?: string };

export async function findCommitAnchor(
	db: Db,
	itemId: number,
): Promise<CommitAnchor> {
	const rows = await db
		.select({ kind: itemGitRefs.kind, ref: itemGitRefs.ref })
		.from(itemGitRefs)
		.where(
			and(
				eq(itemGitRefs.itemId, itemId),
				inArray(itemGitRefs.kind, ["commit", "commit-parent"]),
			),
		)
		.orderBy(asc(itemGitRefs.createdAt));

	const anchor: CommitAnchor = {};
	for (const row of rows) {
		if (row.kind === "commit") anchor.commit ??= row.ref;
		else anchor.parent ??= row.ref;
	}
	return anchor;
}
