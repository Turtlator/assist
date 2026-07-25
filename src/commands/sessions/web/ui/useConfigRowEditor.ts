import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { type ConfigScope, saveConfigValue } from "./saveConfigValue";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

function initialValue(entry: ConfigEntry): string | boolean {
	if (entry.type === "boolean") return entry.value === true;
	if (entry.value === undefined || entry.value === null) return "";
	return String(entry.value);
}

export function useConfigRowEditor({ entry, cwd, onSaved, onError }: Options) {
	const [value, setValue] = useState<string | boolean>(initialValue(entry));
	const [scope, setScope] = useState<ConfigScope>("project");
	const [saving, setSaving] = useState(false);

	async function save(): Promise<void> {
		setSaving(true);
		const { error } = await saveConfigValue({
			key: entry.key,
			value,
			cwd,
			scope,
		});
		setSaving(false);
		if (error) onError(error);
		else onSaved();
	}

	return { value, setValue, scope, setScope, saving, save };
}
