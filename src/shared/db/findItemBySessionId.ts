import { asc, eq } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseUsage } from "./schema";

export async function findItemBySessionId(
	db: Db,
	claudeSessionId: string,
): Promise<number | undefined> {
	const rows = await db
		.select({ itemId: phaseUsage.itemId })
		.from(phaseUsage)
		.where(eq(phaseUsage.claudeSessionId, claudeSessionId))
		.orderBy(asc(phaseUsage.itemId), asc(phaseUsage.phaseIdx))
		.limit(1);
	return rows[0]?.itemId;
}
