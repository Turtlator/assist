import Box from "@mui/material/Box";
import type { ConfigNode } from "../../../../shared/ConfigNode";
import { ConfigEntryActions } from "./ConfigEntryActions";
import { ConfigEntryBlock } from "./ConfigEntryBlock";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";

type Props = {
	node: ConfigNode;
	label: string;
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
			<ConfigEntryBlock>
				<Render
					node={node}
					label={label}
					value={value}
					disabled={disabled}
					onChange={onChange}
				/>
			</ConfigEntryBlock>
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
