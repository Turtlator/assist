import { useEffect, useState } from "react";
import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import { fetchUsageHistory } from "./fetchUsageHistory";
import type { UsageWindowFilterValue } from "./UsageWindowFilter";

export function useUsageHistoryFetch(
	page: number,
	pageSize: number,
	window: UsageWindowFilterValue,
) {
	const [rows, setRows] = useState<UsagePeakRow[]>([]);
	const [total, setTotal] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [loadError, setLoadError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;
		setFetching(true);
		fetchUsageHistory(page, pageSize, window).then(
			(data) => {
				if (cancelled) return;
				setRows(data.rows);
				setTotal(data.total);
				setLoaded(true);
				setFetching(false);
			},
			(error: unknown) => {
				if (cancelled) return;
				setLoadError(error instanceof Error ? error : new Error(String(error)));
				setFetching(false);
			},
		);
		return () => {
			cancelled = true;
		};
	}, [page, pageSize, window]);

	return { rows, total, loaded, fetching, error: loadError };
}
