import TextField from "@mui/material/TextField";
import { useState } from "react";
import {
	isRedactedSecret,
	REDACTED_SECRET,
} from "../../../../shared/redactConfigSecrets";
import type { ConfigNodeEditorProps } from "./ConfigNodeEditorRenderer";

export function ConfigSecretInput({
	label,
	value,
	disabled,
	onChange,
}: ConfigNodeEditorProps) {
	const [text, setText] = useState("");

	return (
		<TextField
			size="small"
			type="password"
			value={text}
			disabled={disabled}
			autoComplete="new-password"
			helperText={
				isRedactedSecret(value)
					? "set (hidden) — leave blank to keep it"
					: "not set — enter a value"
			}
			slotProps={{ htmlInput: { "aria-label": label } }}
			onChange={(event) => {
				setText(event.target.value);
				onChange(
					event.target.value === "" ? REDACTED_SECRET : event.target.value,
				);
			}}
			sx={{ minWidth: 220 }}
		/>
	);
}
