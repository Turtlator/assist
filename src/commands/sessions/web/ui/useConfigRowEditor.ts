import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { effectiveConfigValue } from "./effectiveConfigValue";
import { type ConfigScope, saveConfigValue } from "./saveConfigValue";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

function initialValue(entry: ConfigEntry): string | boolean {
	const value = effectiveConfigValue(entry);
	if (entry.type === "boolean") return value === true;
	if (value === undefined || value === null) return "";
	return String(value);
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
