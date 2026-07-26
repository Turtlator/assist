import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { CloseViewButton } from "./CloseViewButton";
import { FileTypeIcon } from "./FileTypeIcon";

export type FileViewMode = "raw" | "rendered";

const headerSx = {
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: 2,
	mb: 1,
} as const;

const pathSx = { fontFamily: "monospace", fontSize: 13 } as const;

const titleSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	minWidth: 0,
} as const;

const actionsSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	flexShrink: 0,
} as const;

export function FileViewHeader({
	path,
	mode,
	onModeChange,
}: {
	path: string;
	mode?: FileViewMode;
	onModeChange: (mode: FileViewMode) => void;
}) {
	return (
		<Box sx={headerSx}>
			<Box sx={titleSx}>
				<FileTypeIcon path={path} />
				<Typography color="text.secondary" sx={pathSx}>
					{path}
				</Typography>
			</Box>
			<Box sx={actionsSx}>
				{mode && (
					<ToggleButtonGroup
						exclusive
						size="small"
						value={mode}
						onChange={(_, next: FileViewMode | null) =>
							next && onModeChange(next)
						}
					>
						<ToggleButton value="raw">Raw</ToggleButton>
						<ToggleButton value="rendered">Rendered</ToggleButton>
					</ToggleButtonGroup>
				)}
				<CloseViewButton />
			</Box>
		</Box>
	);
}
