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

export function DiffToolbarActions({
	commentHint,
	mode,
	onToggleMode,
	onClose,
}: DiffToolbarActionProps) {
	return (
		<>
			<Box sx={{ ml: "auto" }} />
			{commentHint ? (
				<Typography variant="caption" color="text.secondary" noWrap>
					{commentHint}
				</Typography>
			) : null}
			{mode !== undefined && onToggleMode !== undefined && (
				<DiffModeToggle mode={mode} onToggleMode={onToggleMode} />
			)}
			<CloseViewButton onClose={onClose} />
		</>
	);
}
