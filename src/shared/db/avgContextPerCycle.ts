import { count, sql } from "drizzle-orm";
import type { Db } from "./Db";
import { phaseCycleContext } from "./schema";

export function avgContextPerCycle(db: Db) {
	return db
		.select({
			window: phaseCycleContext.window,
			resetsAt: phaseCycleContext.resetsAt,
			avgContextPct: sql<
				number | null
			>`cast(avg(${phaseCycleContext.peakContextPct}) as double precision)`.as(
				"avg_context_pct",
			),
			phaseCount: count().as("phase_count"),
		})
		.from(phaseCycleContext)
		.groupBy(phaseCycleContext.window, phaseCycleContext.resetsAt)
		.as("avg_context");
}
