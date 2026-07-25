import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { parseDiff, type ViewType } from "react-diff-view";
import { useSearchParams } from "react-router";
import { DiffToolbar } from "./DiffToolbar";
import { diffSx } from "./diffSx";
import { FileDiff, fileKey } from "./FileDiff";
import { type DiffChangeType, filterDiffFiles } from "./filterDiffFiles";
import { PageShell } from "./PageShell";
import { useDiff } from "./useDiff";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function DiffView() {
	const [searchParams] = useSearchParams();
	const { selectedCwd } = useRepoSelectionContext();
	const cwd = searchParams.get("cwd") || selectedCwd;
	const { diff, loading, error } = useDiff(cwd);
	const [viewType, setViewType] = useState<ViewType>("split");
	const [search, setSearch] = useState("");
	const [changeType, setChangeType] = useState<DiffChangeType>("all");

	const files = error || !diff ? [] : parseDiff(diff);
	const filtered = filterDiffFiles(files, { query: search, changeType });

	return (
		<PageShell
			loading={loading}
			isEmpty={files.length === 0}
			emptyMessage={error ? "Failed to load diff." : "No working-tree changes."}
			maxWidth={false}
		>
			<DiffToolbar
				viewType={viewType}
				onChange={setViewType}
				search={search}
				onSearchChange={setSearch}
				changeType={changeType}
				onChangeTypeChange={setChangeType}
			/>
			{filtered.length === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No files match your filter.
				</Typography>
			) : (
				<Box sx={diffSx}>
					{filtered.map((file) => (
						<FileDiff
							key={fileKey(file)}
							file={file}
							viewType={viewType}
							cwd={cwd}
						/>
					))}
				</Box>
			)}
		</PageShell>
	);
}
