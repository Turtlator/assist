import TextField from "@mui/material/TextField";

type Props = {
	label: string;
	value: string;
	disabled: boolean;
	onChange: (value: string) => void;
};

export function ConfigListInput({ label, value, disabled, onChange }: Props) {
	return (
		<TextField
			multiline
			minRows={2}
			size="small"
			value={value}
			disabled={disabled}
			helperText="one entry per line"
			slotProps={{ htmlInput: { "aria-label": label } }}
			onChange={(event) => onChange(event.target.value)}
			sx={{ minWidth: 320 }}
		/>
	);
}

export function splitConfigListInput(value: string): string[] {
	return value
		.split("\n")
		.map((entry) => entry.trim())
		.filter((entry) => entry !== "");
}

export function joinConfigListInput(value: unknown): string {
	return Array.isArray(value) ? value.map(String).join("\n") : "";
}
