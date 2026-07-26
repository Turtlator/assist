import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { effectiveConfigValue } from "./effectiveConfigValue";
import { normalizeConfigValue } from "./normalizeConfigValue";
import { type ConfigScope, saveConfigValue } from "./saveConfigValue";
import { unsetConfigValue } from "./unsetConfigValue";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

function requestValue(entry: ConfigEntry, value: unknown): unknown {
	return entry.node ? normalizeConfigValue(entry.node, value) : value;
}

export function useConfigRowEditor({ entry, cwd, onSaved, onError }: Options) {
	const scopeLocked = entry.globalOnly === true;
	const [value, setValue] = useState<unknown>(effectiveConfigValue(entry));
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

	async function clear(): Promise<void> {
		setSaving(true);
		const { error } = await unsetConfigValue({ key: entry.key, cwd, scope });
		setSaving(false);
		if (error) onError(error);
		else onSaved();
	}

	return {
		value,
		setValue,
		scope,
		setScope,
		scopeLocked,
		saving,
		save,
		clear,
		canClear: entry.source === "project" || entry.source === "global",
	};
}
