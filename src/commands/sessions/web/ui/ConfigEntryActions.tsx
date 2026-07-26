import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

type Props = {
	label: string;
	disabled: boolean;
	onMoveUp?: () => void;
	onMoveDown?: () => void;
	onRemove: () => void;
};

export function ConfigEntryActions({
	label,
	disabled,
	onMoveUp,
	onMoveDown,
	onRemove,
}: Props) {
	return (
		<Stack direction="row" sx={{ flexShrink: 0 }}>
			{onMoveUp && (
				<IconButton
					size="small"
					aria-label={`Move ${label} up`}
					disabled={disabled}
					onClick={onMoveUp}
				>
					<ArrowDropUpIcon fontSize="inherit" />
				</IconButton>
			)}
			{onMoveDown && (
				<IconButton
					size="small"
					aria-label={`Move ${label} down`}
					disabled={disabled}
					onClick={onMoveDown}
				>
					<ArrowDropDownIcon fontSize="inherit" />
				</IconButton>
			)}
			<IconButton
				size="small"
				aria-label={`Remove ${label}`}
				disabled={disabled}
				onClick={onRemove}
			>
				<CloseIcon fontSize="inherit" />
			</IconButton>
		</Stack>
	);
}
