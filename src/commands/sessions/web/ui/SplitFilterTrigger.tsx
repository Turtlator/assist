import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import type { ReactNode } from "react";
import { filterTriggerSx } from "./filterTriggerSx";

export function SplitFilterTrigger({
	label,
	open,
	onClick,
	onDefaultAction,
	disabled = false,
}: {
	label: ReactNode;
	open: boolean;
	onClick: () => void;
	onDefaultAction: () => void;
	disabled?: boolean;
}) {
	const Chevron = open ? ArrowDropUpIcon : ArrowDropDownIcon;
	const chevronLabel =
		typeof label === "string" ? `${label} options` : "options";

	return (
		<ButtonGroup size="small" variant="outlined" disabled={disabled} fullWidth>
			<Button
				disabled={disabled}
				onClick={onDefaultAction}
				sx={{ ...filterTriggerSx, justifyContent: "center" }}
			>
				{label}
			</Button>
			<Button
				disabled={disabled}
				onClick={onClick}
				aria-label={chevronLabel}
				title={chevronLabel}
				aria-haspopup="true"
				aria-expanded={open}
				sx={{ flex: "0 0 auto", minWidth: 0, px: 0.25 }}
			>
				<Chevron sx={{ fontSize: 18 }} />
			</Button>
		</ButtonGroup>
	);
}
