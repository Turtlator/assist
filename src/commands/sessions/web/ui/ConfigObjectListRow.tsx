import Box from "@mui/material/Box";
import type { ConfigNode } from "../../../../shared/ConfigNode";
import { ConfigEntryActions } from "./ConfigEntryActions";
import { ConfigFieldRow } from "./ConfigFieldRow";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";

type Props = {
	node: ConfigNode;
	label: string;
	index: number;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove: () => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigObjectListRow({
	node,
	label,
	index,
	value,
	disabled,
	onChange,
	onMoveUp,
	onMoveDown,
	onRemove,
	render: Render,
}: Props) {
	return (
		<Box sx={{ display: "flex", gap: 1, width: "100%" }}>
			<ConfigFieldRow label={`[${index}]`}>
				<Render
					node={node}
					label={label}
					value={value}
					disabled={disabled}
					onChange={onChange}
				/>
			</ConfigFieldRow>
			<ConfigEntryActions
				label={label}
				disabled={disabled}
				onMoveUp={onMoveUp}
				onMoveDown={onMoveDown}
				onRemove={onRemove}
			/>
		</Box>
	);
}
