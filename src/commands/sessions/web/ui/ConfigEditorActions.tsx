import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { ConfigScopeToggle } from "./ConfigScopeToggle";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	entryKey: string;
	scope: ConfigScope;
	scopeLocked: boolean;
	saving: boolean;
	canClear: boolean;
	onScopeChange: (scope: ConfigScope) => void;
	onSave: () => void;
	onClear: () => void;
	onCancel: () => void;
};

export function ConfigEditorActions({
	entryKey,
	scope,
	scopeLocked,
	saving,
	canClear,
	onScopeChange,
	onSave,
	onClear,
	onCancel,
}: Props) {
	return (
		<Stack
			spacing={1}
			direction="row"
			sx={{ alignItems: "center", flexWrap: "wrap" }}
		>
			<ConfigScopeToggle
				scope={scope}
				disabled={saving}
				lockedToGlobal={scopeLocked}
				onChange={onScopeChange}
			/>
			<Button
				size="small"
				variant="contained"
				disabled={saving}
				onClick={onSave}
			>
				Save
			</Button>
			<Button size="small" disabled={saving} onClick={onCancel}>
				Cancel
			</Button>
			{canClear && (
				<Button
					size="small"
					color="error"
					disabled={saving}
					title={`Remove ${entryKey} from the ${scope} config`}
					onClick={onClear}
				>
					Clear
				</Button>
			)}
		</Stack>
	);
}
