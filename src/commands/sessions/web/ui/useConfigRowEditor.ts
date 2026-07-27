import { useState } from "react";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { effectiveConfigValue } from "./effectiveConfigValue";
import type { ConfigScope } from "./saveConfigValue";
import { useConfigRowWrites } from "./useConfigRowWrites";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function useConfigRowEditor({ entry, cwd, onSaved, onError }: Options) {
	const scopeLocked = entry.globalOnly === true;
	const saved = effectiveConfigValue(entry);
	const [value, setValue] = useState<unknown>(saved);
	const [scope, setScope] = useState<ConfigScope>(
		scopeLocked ? "global" : "project",
	);
	const { saving, save, clear } = useConfigRowWrites({
		entry,
		cwd,
		scope,
		onSaved,
		onError,
	});

	return {
		value,
		setValue,
		scope,
		setScope,
		scopeLocked,
		saving,
		save: () => save(value),
		clear,
		canClear: entry.source !== "default",
		dirty: JSON.stringify(value) !== JSON.stringify(saved),
		reset: () => setValue(saved),
	};
}
