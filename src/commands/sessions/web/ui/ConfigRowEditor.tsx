import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigNodeEditor } from "./ConfigNodeEditor";
import { ConfigScopeToggle } from "./ConfigScopeToggle";
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
	const { value, setValue, scope, setScope, scopeLocked, saving, save } =
		useConfigRowEditor({ entry, cwd, onSaved, onError });

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start" }}>
			{entry.node && (
				<ConfigNodeEditor
					node={entry.node}
					label={entry.key}
					value={value}
					disabled={saving}
					onChange={setValue}
				/>
			)}
			<Stack
				spacing={1}
				direction="row"
				sx={{ alignItems: "center", flexWrap: "wrap" }}
			>
				<ConfigScopeToggle
					scope={scope}
					disabled={saving}
					lockedToGlobal={scopeLocked}
					onChange={setScope}
				/>
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
		</Stack>
	);
}
