import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import type { ReactNode } from "react";

const triggerSx = {
	textTransform: "none",
	fontSize: 11,
	justifyContent: "space-between",
	maxWidth: "100%",
	overflow: "hidden",
} as const;

export function FilterTrigger({
	label,
	open,
	onClick,
	onDefaultAction,
	disabled = false,
}: {
	label: ReactNode;
	open: boolean;
	onClick: () => void;
	onDefaultAction?: () => void;
	disabled?: boolean;
}) {
	if (!onDefaultAction)
		return (
			<Button
				size="small"
				variant="outlined"
				disabled={disabled}
				onClick={onClick}
				endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
				sx={triggerSx}
				fullWidth
			>
				{label}
			</Button>
		);

	const Chevron = open ? ArrowDropUpIcon : ArrowDropDownIcon;

	return (
		<ButtonGroup size="small" variant="outlined" disabled={disabled} fullWidth>
			<Button
				disabled={disabled}
				onClick={onDefaultAction}
				sx={{ ...triggerSx, justifyContent: "center" }}
			>
				{label}
			</Button>
			<Button
				disabled={disabled}
				onClick={onClick}
				aria-label={typeof label === "string" ? `${label} options` : "options"}
				sx={{ flex: "0 0 auto", minWidth: 0, px: 0.25 }}
			>
				<Chevron sx={{ fontSize: 18 }} />
			</Button>
		</ButtonGroup>
	);
}
