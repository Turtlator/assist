import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import type { ConfigEntry } from "../../../config/readConfigEntries";

type Props = {
	entry: ConfigEntry;
	value: string | boolean;
	disabled: boolean;
	onChange: (value: string | boolean) => void;
};

export function ConfigValueInput({ entry, value, disabled, onChange }: Props) {
	if (entry.type === "boolean") {
		return (
			<Switch
				size="small"
				checked={value === true}
				disabled={disabled}
				slotProps={{ input: { "aria-label": `${entry.key} value` } }}
				onChange={(event) => onChange(event.target.checked)}
			/>
		);
	}
	if (entry.type === "enum") {
		return (
			<TextField
				select
				size="small"
				label={entry.key}
				value={typeof value === "string" ? value : ""}
				disabled={disabled}
				onChange={(event) => onChange(event.target.value)}
				sx={{ minWidth: 180 }}
			>
				{(entry.enumValues ?? []).map((option) => (
					<MenuItem key={option} value={option}>
						{option}
					</MenuItem>
				))}
			</TextField>
		);
	}
	return (
		<TextField
			size="small"
			label={entry.key}
			type={entry.type === "number" ? "number" : "text"}
			value={typeof value === "string" ? value : ""}
			disabled={disabled}
			onChange={(event) => onChange(event.target.value)}
			sx={{ minWidth: 220 }}
		/>
	);
}
