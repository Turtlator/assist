import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { ConfigObjectListNode } from "../../../../shared/ConfigNode";
import type { ConfigNodeEditorRenderer } from "./ConfigNodeEditorRenderer";
import { ConfigObjectListRow } from "./ConfigObjectListRow";
import {
	moveConfigListItem,
	removeConfigListItem,
	replaceConfigListItem,
} from "./moveConfigListItem";

type Props = {
	node: ConfigObjectListNode;
	label: string;
	value: unknown;
	disabled: boolean;
	onChange: (value: unknown) => void;
	render: ConfigNodeEditorRenderer;
};

export function ConfigObjectListEditor({
	node,
	label,
	value,
	disabled,
	onChange,
	render,
}: Props) {
	const items = Array.isArray(value) ? value : [];

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start", width: "100%" }}>
			{items.map((item, index) => (
				<ConfigObjectListRow
					key={`[${index}]`}
					node={node.item}
					label={`${label}[${index}]`}
					index={index}
					value={item}
					disabled={disabled}
					render={render}
					onChange={(next) =>
						onChange(replaceConfigListItem(items, index, next))
					}
					onMoveUp={() => onChange(moveConfigListItem(items, index, index - 1))}
					onMoveDown={() =>
						onChange(moveConfigListItem(items, index, index + 1))
					}
					onRemove={() => onChange(removeConfigListItem(items, index))}
				/>
			))}
			<Button
				size="small"
				startIcon={<AddIcon fontSize="inherit" />}
				disabled={disabled}
				onClick={() => onChange([...items, {}])}
			>
				{`Add ${label} entry`}
			</Button>
		</Stack>
	);
}
