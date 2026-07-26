import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { ConfigRowTypeCell } from "./ConfigRowTypeCell";
import { ConfigRowValueCell } from "./ConfigRowValueCell";

function isReadOnly(entry: ConfigEntry): boolean {
	return !entry.node || entry.node.kind === "other";
}

type Props = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function ConfigRow({ entry, cwd, onSaved, onError }: Props) {
	const [editing, setEditing] = useState(false);
	const readOnly = isReadOnly(entry);
	const list =
		entry.node?.kind === "objectList" && cwd !== "" ? entry.node : undefined;

	return (
		<TableRow>
			<TableCell
				sx={{ fontFamily: "monospace", verticalAlign: "top", width: "35%" }}
			>
				{entry.key}
			</TableCell>
			<ConfigRowValueCell
				entry={entry}
				list={list}
				editing={editing}
				cwd={cwd}
				onError={onError}
				onCancel={() => setEditing(false)}
				onSaved={() => {
					setEditing(false);
					onSaved();
				}}
			/>
			<ConfigRowTypeCell
				entry={entry}
				readOnly={readOnly}
				canEdit={!readOnly && !editing && !list && cwd !== ""}
				onEdit={() => setEditing(true)}
			/>
		</TableRow>
	);
}
