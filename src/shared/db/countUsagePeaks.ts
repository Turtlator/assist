import { count, eq } from "drizzle-orm";
import type { Db } from "./Db";
import type { UsagePeakWindow } from "./listUsagePeaks";
import { usagePeaks } from "./schema";

export async function countUsagePeaks(
	db: Db,
	window?: UsagePeakWindow,
): Promise<number> {
	const [row] = await db
		.select({ value: count() })
		.from(usagePeaks)
		.where(window ? eq(usagePeaks.window, window) : undefined);
	return row?.value ?? 0;
}
