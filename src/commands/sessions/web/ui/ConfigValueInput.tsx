import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigBooleanInput } from "./ConfigBooleanInput";
import { ConfigEnumInput } from "./ConfigEnumInput";
import { ConfigListInput } from "./ConfigListInput";
import { ConfigTextInput } from "./ConfigTextInput";

type Props = {
	entry: ConfigEntry;
	value: string | boolean;
	disabled: boolean;
	onChange: (value: string | boolean) => void;
};

export function ConfigValueInput({ entry, value, disabled, onChange }: Props) {
	const text = typeof value === "string" ? value : "";

	if (entry.type === "boolean") {
		return (
			<ConfigBooleanInput
				label={entry.key}
				checked={value === true}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}
	if (entry.type === "array") {
		return (
			<ConfigListInput
				label={entry.key}
				value={text}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}
	if (entry.type === "enum") {
		return (
			<ConfigEnumInput
				label={entry.key}
				options={entry.enumValues ?? []}
				value={text}
				disabled={disabled}
				onChange={onChange}
			/>
		);
	}
	return (
		<ConfigTextInput
			label={entry.key}
			value={text}
			numeric={entry.type === "number"}
			helperText={
				entry.type === "union"
					? (entry.unionTypes ?? []).join(" or ")
					: undefined
			}
			disabled={disabled}
			onChange={onChange}
		/>
	);
}
