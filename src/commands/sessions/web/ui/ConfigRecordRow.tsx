import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import type { ConfigNode } from "../../../../shared/ConfigNode";
import { ConfigEntryActions } from "./ConfigEntryActions";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";

type Props = {
	node: ConfigNode;
	label: string;
	name: string;
	position: number;
	value: unknown;
	disabled: boolean;
	onRename: (name: string) => void;
	onChange: (value: unknown) => void;
	onRemove: () => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigRecordRow({
	node,
	label,
	name,
	position,
	value,
	disabled,
	onRename,
	onChange,
	onRemove,
	render: Render,
}: Props) {
	return (
		<Box sx={{ display: "flex", gap: 1, width: "100%" }}>
			<TextField
				size="small"
				label={`${label} key ${position}`}
				value={name}
				disabled={disabled}
				onChange={(event) => onRename(event.target.value)}
				sx={{ minWidth: 180 }}
			/>
			<Render
				node={node}
				label={`${label}.${name}`}
				value={value}
				disabled={disabled}
				onChange={onChange}
			/>
			<ConfigEntryActions
				label={`${label} entry ${position}`}
				disabled={disabled}
				onRemove={onRemove}
			/>
		</Box>
	);
}
