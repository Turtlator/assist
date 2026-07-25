import { getDb } from "../../shared/db/getDb";
import { loadConfig } from "../../shared/loadConfig";
import { insertItem } from "./insertItem";
import { insertPhaseAt } from "./insertPhaseAt";
import { insertSubtask } from "./insertSubtask";
import { getOrigin } from "./shared";
import type { BacklogType } from "./types";

type NewItemFields = {
	type: BacklogType;
	name: string;
	description?: string;
	acceptanceCriteria: string[];
};

export async function createItemWithDefaults(
	fields: NewItemFields,
): Promise<number> {
	const orm = await getDb();
	const id = await insertItem(
		orm,
		{
			type: fields.type,
			name: fields.name,
			description: fields.description || undefined,
			acceptanceCriteria: fields.acceptanceCriteria,
			status: "todo",
			starred: false,
		},
		getOrigin(),
	);

	if (fields.type === "bug")
		await insertPhaseAt(orm, id, 0, "Fix", ["Fix the bug"], null, undefined);

	for (const subtask of loadConfig().subtasks ?? []) {
		await insertSubtask(orm, id, subtask.title, subtask.description);
	}

	return id;
}
