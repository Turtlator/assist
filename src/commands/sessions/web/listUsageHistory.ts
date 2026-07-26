import type { IncomingMessage, ServerResponse } from "node:http";
import { countUsagePeaks } from "../../../shared/db/countUsagePeaks";
import { getDb } from "../../../shared/db/getDb";
import {
	listUsagePeaks,
	type UsagePeakWindow,
} from "../../../shared/db/listUsagePeaks";
import { respondJson } from "../../../shared/web";

const DEFAULT_PAGE_SIZE = 30;

function parseWindow(value: string | null): UsagePeakWindow | undefined {
	return value === "five_hour" || value === "seven_day" ? value : undefined;
}

/** Recorded per-cycle peak 5h/7d usage, newest cycle first, for the history page. */
export async function listUsageHistory(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const page = Math.max(0, Number(params.get("page")) || 0);
	const pageSize = Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE;
	const window = parseWindow(params.get("window"));
	const db = await getDb();
	const [rows, total] = await Promise.all([
		listUsagePeaks(db, { limit: pageSize, offset: page * pageSize, window }),
		countUsagePeaks(db, window),
	]);
	respondJson(res, 200, { rows, total });
}
