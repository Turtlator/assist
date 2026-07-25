import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigScopeToggle } from "./ConfigScopeToggle";
import { ConfigValueInput } from "./ConfigValueInput";
import { useConfigRowEditor } from "./useConfigRowEditor";

type Props = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
	onCancel: () => void;
};

export function ConfigRowEditor({
	entry,
	cwd,
	onSaved,
	onError,
	onCancel,
}: Props) {
	const { value, setValue, scope, setScope, saving, save } = useConfigRowEditor(
		{ entry, cwd, onSaved, onError },
	);

	return (
		<Stack
			spacing={1}
			direction="row"
			sx={{ alignItems: "center", flexWrap: "wrap" }}
		>
			<ConfigValueInput
				entry={entry}
				value={value}
				disabled={saving}
				onChange={setValue}
			/>
			<ConfigScopeToggle scope={scope} disabled={saving} onChange={setScope} />
			<Button
				size="small"
				variant="contained"
				disabled={saving}
				onClick={() => void save()}
			>
				Save
			</Button>
			<Button size="small" disabled={saving} onClick={onCancel}>
				Cancel
			</Button>
		</Stack>
	);
}
