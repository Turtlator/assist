import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { avgContextPerCycle } from "./avgContextPerCycle";
import type { Db } from "./Db";
import { usagePeaks } from "./schema";

export type UsagePeakRow = typeof usagePeaks.$inferSelect & {
	avgContextPct: number | null;
	phaseCount: number | null;
};

export type UsagePeakWindow = UsagePeakRow["window"];

type ListUsagePeaksOptions = {
	limit?: number;
	offset?: number;
	window?: UsagePeakWindow;
};

/**
 * All recorded usage peaks, newest cycle first (descending `resetsAt`) with
 * `window` as a stable cross-window tiebreak, then `createdAt` descending so a
 * cycle's segments stack newest-first by when each reading landed — the current
 * post-reset value on top, earlier (badged) pre-reset peaks beneath. `segment`
 * is a final tiebreak should two readings share a timestamp. An optional
 * `window` narrows the result to one rate-limit bucket.
 */
export async function listUsagePeaks(
	db: Db,
	options?: ListUsagePeaksOptions,
): Promise<UsagePeakRow[]> {
	const avgContext = avgContextPerCycle(db);
	const query = db
		.select({
			...getTableColumns(usagePeaks),
			avgContextPct: avgContext.avgContextPct,
			phaseCount: avgContext.phaseCount,
		})
		.from(usagePeaks)
		.leftJoin(
			avgContext,
			and(
				eq(usagePeaks.window, avgContext.window),
				eq(usagePeaks.resetsAt, avgContext.resetsAt),
			),
		)
		.where(options?.window ? eq(usagePeaks.window, options.window) : undefined)
		.orderBy(
			desc(usagePeaks.resetsAt),
			usagePeaks.window,
			desc(usagePeaks.createdAt),
			desc(usagePeaks.segment),
		);
	if (options?.limit !== undefined) {
		return query.limit(options.limit).offset(options.offset ?? 0);
	}
	return query;
}
