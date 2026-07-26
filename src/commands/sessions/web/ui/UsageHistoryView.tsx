import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { PageShell } from "./PageShell";
import { usagePeakWindow } from "./usagePeakWindow";
import { UsagePeaksPager } from "./UsagePeaksPager";
import { UsageWindowFilter } from "./UsageWindowFilter";
import { useUsageHistoryPage } from "./useUsageHistoryPage";

export function UsageHistoryView() {
	const history = useUsageHistoryPage();
	const { window, total, error } = history;

	if (error) throw error;

	return (
		<PageShell
			loading={!history.loaded}
			title="Usage history"
			isEmpty={total === 0 && window === "all"}
			emptyMessage="No usage peaks recorded yet."
		>
			<UsageWindowFilter window={window} onChange={history.selectWindow} />
			<Box sx={{ height: 4, my: 1 }}>
				{history.fetching && <LinearProgress />}
			</Box>
			{window !== "all" && total === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No {usagePeakWindow[window].label} usage peaks recorded yet.
				</Typography>
			) : (
				<UsagePeaksPager
					rows={history.rows}
					total={total}
					page={history.page}
					pageSize={history.pageSize}
					onPageChange={history.setPage}
				/>
			)}
		</PageShell>
	);
}
