import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Stack from "@mui/material/Stack";
import { ConfigActionButton } from "./ConfigActionButton";

type Props = {
	label: string;
	disabled: boolean;
	open?: boolean;
	onToggle?: () => void;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	onRemove: () => void;
};

export function ConfigEntryActions({
	label,
	disabled,
	open,
	onToggle,
	onMoveUp,
	onMoveDown,
	onRemove,
}: Props) {
	return (
		<Stack direction="row" sx={{ flexShrink: 0 }}>
			<ConfigActionButton
				label={open ? `Done editing ${label}` : `Edit ${label}`}
				disabled={disabled}
				icon={
					open ? (
						<CheckIcon fontSize="inherit" />
					) : (
						<EditIcon fontSize="inherit" />
					)
				}
				onClick={onToggle}
			/>
			<ConfigActionButton
				label={`Move ${label} up`}
				disabled={disabled}
				icon={<ArrowDropUpIcon fontSize="inherit" />}
				onClick={onMoveUp}
			/>
			<ConfigActionButton
				label={`Move ${label} down`}
				disabled={disabled}
				icon={<ArrowDropDownIcon fontSize="inherit" />}
				onClick={onMoveDown}
			/>
			<ConfigActionButton
				label={`Remove ${label}`}
				disabled={disabled}
				icon={<CloseIcon fontSize="inherit" />}
				onClick={onRemove}
			/>
		</Stack>
	);
}
