import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigRowEditor } from "./ConfigRowEditor";
import { ConfigRowTypeCell } from "./ConfigRowTypeCell";
import { ConfigValue } from "./ConfigValue";

const COMPLEX_TYPES = new Set(["array", "record", "other"]);

type Props = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function ConfigRow({ entry, cwd, onSaved, onError }: Props) {
	const [editing, setEditing] = useState(false);
	const readOnly = COMPLEX_TYPES.has(entry.type);

	return (
		<TableRow>
			<TableCell
				sx={{ fontFamily: "monospace", verticalAlign: "top", width: "35%" }}
			>
				{entry.key}
			</TableCell>
			<TableCell sx={{ verticalAlign: "top" }}>
				{editing ? (
					<ConfigRowEditor
						entry={entry}
						cwd={cwd}
						onError={onError}
						onCancel={() => setEditing(false)}
						onSaved={() => {
							setEditing(false);
							onSaved();
						}}
					/>
				) : (
					<ConfigValue entry={entry} />
				)}
			</TableCell>
			<ConfigRowTypeCell
				entry={entry}
				readOnly={readOnly}
				canEdit={!readOnly && !editing && cwd !== ""}
				onEdit={() => setEditing(true)}
			/>
		</TableRow>
	);
}
