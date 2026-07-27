import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import type { CommitRef } from "../../../../shared/db/listCommitRefs";

export const DEFAULT_DIFF_SCOPE = "all";
export const BRANCH_DIFF_SCOPE = "branch";

function diffScopeOptions(
	commits: CommitRef[],
	branchBase: string | null,
): { value: string; label: string }[] {
	return [
		{ value: DEFAULT_DIFF_SCOPE, label: "All" },
		{ value: "uncommitted", label: "Uncommitted" },
		...(branchBase
			? [{ value: BRANCH_DIFF_SCOPE, label: `Branch (${branchBase})` }]
			: []),
		...commits.map((commit) => ({
			value: commit.sha,
			label: commit.title || commit.sha.slice(0, 7),
		})),
	];
}

export function DiffScopePicker({
	scope,
	commits,
	branchBase,
	onChange,
}: {
	scope: string;
	commits: CommitRef[];
	branchBase: string | null;
	onChange: (scope: string) => void;
}) {
	const options = diffScopeOptions(commits, branchBase);
	const value = options.some((option) => option.value === scope)
		? scope
		: DEFAULT_DIFF_SCOPE;

	return (
		<TextField
			select
			size="small"
			label="Scope"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			sx={{
				width: 220,
				"& .MuiSelect-select": { fontSize: 12 },
				"& .MuiInputLabel-root": { fontSize: 12 },
			}}
		>
			{options.map((option) => (
				<MenuItem key={option.value} value={option.value} sx={{ fontSize: 12 }}>
					{option.label}
				</MenuItem>
			))}
		</TextField>
	);
}
