import { useEffect, useState } from "react";
import type { UsageWindowFilterValue } from "./UsageWindowFilter";
import { useUsageHistoryFetch } from "./useUsageHistoryFetch";

const PAGE_SIZE = 30;

export function useUsageHistoryPage() {
	const [page, setPage] = useState(0);
	const [window, setWindow] = useState<UsageWindowFilterValue>("all");
	const fetched = useUsageHistoryFetch(page, PAGE_SIZE, window);
	const { total } = fetched;

	useEffect(() => {
		if (total === 0) return;
		const lastPage = Math.ceil(total / PAGE_SIZE) - 1;
		if (page > lastPage) setPage(lastPage);
	}, [page, total]);

	const selectWindow = (next: UsageWindowFilterValue) => {
		setWindow(next);
		setPage(0);
	};

	return {
		...fetched,
		page,
		setPage,
		window,
		selectWindow,
		pageSize: PAGE_SIZE,
	};
}
