import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { configClearTitle } from "./configClearTitle";
import { ConfigScopeToggle } from "./ConfigScopeToggle";
import { configScopesWithValue } from "./configScopesWithValue";
import { ConfigWriteButtons } from "./ConfigWriteButtons";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	entry: ConfigEntry;
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
	entry,
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
				scopesWithValue={configScopesWithValue(entry)}
				repoKey={entry.repoKey}
				onChange={onScopeChange}
			/>
			<ConfigWriteButtons
				saving={saving}
				canClear={canClear}
				clearTitle={configClearTitle(entry, scope)}
				onSave={onSave}
				onClear={onClear}
				onCancel={onCancel}
			/>
		</Stack>
	);
}
