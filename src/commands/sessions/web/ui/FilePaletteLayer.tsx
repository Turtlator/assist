import { useCallback, useState } from "react";
import { FilePalette } from "./FilePalette";
import { useQuickOpenHotkey } from "./useQuickOpenHotkey";

export function FilePaletteLayer() {
	const [open, setOpen] = useState(false);
	useQuickOpenHotkey(useCallback(() => setOpen(true), []));

	if (!open) return null;
	return <FilePalette onClose={() => setOpen(false)} />;
}
