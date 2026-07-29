import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CloseViewButton } from "./CloseViewButton";
import { DiffModeToggle } from "./DiffModeToggle";
import type { DiffPanelMode } from "./toggleDiffPanel";

export type DiffToolbarActionProps = {
	commentHint?: string;
	mode?: DiffPanelMode;
	onToggleMode?: () => void;
	onClose?: () => void;
};

const ruleSx = {
	flex: "0 0 auto",
	width: "1px",
	alignSelf: "stretch",
	my: 1,
	mx: 0.25,
	bgcolor: "divider",
} as const;

export function DiffToolbarActions({
	commentHint,
	mode,
	onToggleMode,
	onClose,
}: DiffToolbarActionProps) {
	return (
		<>
			{commentHint ? (
				<Typography variant="caption" color="text.secondary" noWrap>
					{commentHint}
				</Typography>
			) : null}
			<Box sx={ruleSx} />
			{mode !== undefined && onToggleMode !== undefined && (
				<DiffModeToggle mode={mode} onToggleMode={onToggleMode} />
			)}
			<CloseViewButton onClose={onClose} />
		</>
	);
}
