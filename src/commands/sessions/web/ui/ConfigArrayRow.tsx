import Stack from "@mui/material/Stack";
import type { ConfigNode } from "../../../../shared/ConfigNode";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigEditorActions } from "./ConfigEditorActions";
import { ConfigNodeEditor } from "./ConfigNodeEditor";
import { useConfigRowEditor } from "./useConfigRowEditor";

type Props = {
	entry: ConfigEntry;
	node: ConfigNode;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function ConfigArrayRow({ entry, node, cwd, onSaved, onError }: Props) {
	const editor = useConfigRowEditor({ entry, cwd, onSaved, onError });

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start" }}>
			<ConfigNodeEditor
				node={node}
				label={entry.key}
				value={editor.value}
				disabled={editor.saving}
				onChange={editor.setValue}
			/>
			{editor.dirty && (
				<ConfigEditorActions
					entry={entry}
					scope={editor.scope}
					scopeLocked={editor.scopeLocked}
					saving={editor.saving}
					canClear={editor.canClear}
					onScopeChange={editor.setScope}
					onSave={() => void editor.save()}
					onClear={() => void editor.clear()}
					onCancel={editor.reset}
				/>
			)}
		</Stack>
	);
}
