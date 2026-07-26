import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { normalizeConfigValue } from "./normalizeConfigValue";
import { nothingToClearMessage } from "./nothingToClearMessage";
import { type ConfigScope, saveConfigValue } from "./saveConfigValue";
import { unsetConfigValue } from "./unsetConfigValue";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	scope: ConfigScope;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function useConfigRowWrites({
	entry,
	cwd,
	scope,
	onSaved,
	onError,
}: Options) {
	const [saving, setSaving] = useState(false);

	async function save(value: unknown): Promise<void> {
		setSaving(true);
		const { error } = await saveConfigValue({
			key: entry.key,
			value: entry.node ? normalizeConfigValue(entry.node, value) : value,
			cwd,
			scope,
		});
		setSaving(false);
		if (error) onError(error);
		else onSaved();
	}

	async function clear(): Promise<void> {
		setSaving(true);
		const { error, removed } = await unsetConfigValue({
			key: entry.key,
			cwd,
			scope,
		});
		setSaving(false);
		if (error) onError(error);
		else if (removed === false) onError(nothingToClearMessage(entry, scope));
		else onSaved();
	}

	return { saving, save, clear };
}
