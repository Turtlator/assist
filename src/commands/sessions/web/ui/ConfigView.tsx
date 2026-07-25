import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { ConfigGroupCard } from "./ConfigGroupCard";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { groupConfigEntries } from "./groupConfigEntries";
import { PageShell } from "./PageShell";
import { useConfigEntries } from "./useConfigEntries";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function ConfigView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { entries, loading, error, reload } = useConfigEntries(selectedCwd);
	const [saveError, setSaveError] = useState<string | null>(null);
	const groups = groupConfigEntries(entries);

	return (
		<PageShell
			loading={loading}
			title="Config"
			isEmpty={groups.length === 0}
			emptyMessage={error ?? "No config keys."}
		>
			<Typography variant="caption" color="text.secondary">
				Effective config for {selectedCwd}
			</Typography>
			<Stack spacing={2} sx={{ mt: 1 }}>
				{groups.map((group) => (
					<ConfigGroupCard
						key={group.name}
						group={group}
						cwd={selectedCwd}
						onSaved={reload}
						onError={setSaveError}
					/>
				))}
			</Stack>
			<ErrorSnackbar error={saveError} onClose={() => setSaveError(null)} />
		</PageShell>
	);
}
