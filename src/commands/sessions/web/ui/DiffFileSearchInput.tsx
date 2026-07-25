import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";

export function DiffFileSearchInput({
	search,
	onChange,
}: {
	search: string;
	onChange: (search: string) => void;
}) {
	return (
		<TextField
			autoFocus
			size="small"
			value={search}
			onChange={(e) => onChange(e.target.value)}
			placeholder="Filter files..."
			sx={{ width: 240 }}
			slotProps={{
				input: {
					sx: { fontSize: 12 },
					endAdornment: search ? (
						<IconButton
							size="small"
							aria-label="Clear file filter"
							onClick={() => onChange("")}
						>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					) : undefined,
				},
			}}
		/>
	);
}
