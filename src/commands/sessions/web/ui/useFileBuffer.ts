import { useCallback, useRef, useState } from "react";
import { type SavedFile, saveFileContent } from "./saveFileContent";
import type { FileContentState } from "./fetchFileContent";

type FileBuffer = {
	value: string;
	setValue: (value: string) => void;
	save: () => void;
	saving: boolean;
	dirty: boolean;
	error: string | null;
	clearError: () => void;
};

function loadedFile(state: FileContentState): SavedFile {
	return state.status === "ready"
		? { content: state.content, mtimeMs: state.mtimeMs }
		: { content: "", mtimeMs: 0 };
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
	const [saved, setSaved] = useState<SavedFile>(() => loadedFile(state));
	const [value, setValue] = useState(() => loadedFile(state).content);
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const latest = useRef(value);

	if (loaded !== state) {
		const next = loadedFile(state);
		setLoaded(state);
		setSaved(next);
		setValue(next.content);
	}
	latest.current = value;

	const dirty = state.status === "ready" && value !== saved.content;
	const save = useCallback(() => {
		if (!cwd || !dirty || saving) return;
		setSaving(true);
		saveFileContent(cwd, path, latest.current, saved.mtimeMs)
			.then((result) => {
				setSaved(result);
				setValue(result.content);
			})
			.catch((error: unknown) => setSaveError(saveFailure(error)))
			.finally(() => setSaving(false));
	}, [cwd, path, dirty, saving, saved.mtimeMs]);

	const clearError = useCallback(() => setSaveError(null), []);

	return { value, setValue, save, saving, dirty, error: saveError, clearError };
}
