import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { joinConfigListInput, splitConfigListInput } from "./ConfigListInput";
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
	if (entry.type === "array") return joinConfigListInput(value);
	if (value === undefined || value === null) return "";
	return String(value);
}

function requestValue(
	entry: ConfigEntry,
	value: string | boolean,
): string | boolean | string[] {
	if (entry.type !== "array") return value;
	return splitConfigListInput(typeof value === "string" ? value : "");
}

export function useConfigRowEditor({ entry, cwd, onSaved, onError }: Options) {
	const scopeLocked = entry.globalOnly === true;
	const [value, setValue] = useState<string | boolean>(initialValue(entry));
	const [scope, setScope] = useState<ConfigScope>(
		scopeLocked ? "global" : "project",
	);
	const [saving, setSaving] = useState(false);

	async function save(): Promise<void> {
		setSaving(true);
		const { error } = await saveConfigValue({
			key: entry.key,
			value: requestValue(entry, value),
			cwd,
			scope,
		});
		setSaving(false);
		if (error) onError(error);
		else onSaved();
	}

	return { value, setValue, scope, setScope, scopeLocked, saving, save };
}
