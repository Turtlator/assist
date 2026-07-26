import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { ConfigRecordNode } from "../../../../shared/ConfigNode";
import { asConfigRecord } from "./asConfigRecord";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";
import { ConfigRecordRow } from "./ConfigRecordRow";
import { emptyConfigEntryValue } from "./emptyConfigEntryValue";
import { removeConfigField, renameConfigField } from "./setConfigField";

type Props = {
	node: ConfigRecordNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigRecordEditor({
	node,
	label,
	value,
	disabled,
	onChange,
	render,
}: Props) {
	const record = asConfigRecord(value) ?? {};

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start", width: "100%" }}>
			{Object.entries(record).map(([name, entry], index) => (
				<ConfigRecordRow
					key={`entry-${index}`}
					node={node.value}
					label={label}
					name={name}
					position={index + 1}
					value={entry}
					disabled={disabled}
					render={render}
					onRename={(next) => onChange(renameConfigField(record, index, next))}
					onChange={(next) => onChange({ ...record, [name]: next })}
					onRemove={() => onChange(removeConfigField(record, index))}
				/>
			))}
			<Button
				size="small"
				startIcon={<AddIcon fontSize="inherit" />}
				disabled={disabled}
				onClick={() => onChange({ ...record, "": emptyConfigEntryValue(node) })}
			>
				{`Add ${label} entry`}
			</Button>
		</Stack>
	);
}
