import { useCallback, useRef, useState } from "react";
import { saveFileContent } from "./saveFileContent";
import type { FileContentState } from "./useFileContent";

type FileBuffer = {
	value: string;
	setValue: (value: string) => void;
	save: () => void;
	saving: boolean;
	error: string | null;
	clearError: () => void;
};

function loadedContent(state: FileContentState): string {
	return state.status === "ready" ? state.content : "";
}

function saveFailure(error: unknown): string {
	return error instanceof Error ? error.message : "Failed to save file";
}

export function useFileBuffer(
	cwd: string | undefined,
	path: string,
	state: FileContentState,
): FileBuffer {
	const [loaded, setLoaded] = useState(state);
	const [value, setValue] = useState(() => loadedContent(state));
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const latest = useRef(value);

	if (loaded !== state) {
		setLoaded(state);
		setValue(loadedContent(state));
	}
	latest.current = value;

	const ready = state.status === "ready";
	const save = useCallback(() => {
		if (!cwd || !ready || saving) return;
		setSaving(true);
		saveFileContent(cwd, path, latest.current)
			.then(setValue)
			.catch((error: unknown) => setSaveError(saveFailure(error)))
			.finally(() => setSaving(false));
	}, [cwd, path, ready, saving]);

	const clearError = useCallback(() => setSaveError(null), []);

	return { value, setValue, save, saving, error: saveError, clearError };
}
