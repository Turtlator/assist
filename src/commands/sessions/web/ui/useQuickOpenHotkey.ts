import { useEffect } from "react";
import { isQuickOpenKey } from "./isQuickOpenKey";

const beforeXtermAndBrowser = true;

export function useQuickOpenHotkey(open: () => void): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!isQuickOpenKey(event)) return;
			event.preventDefault();
			open();
		};
		globalThis.addEventListener("keydown", onKeyDown, beforeXtermAndBrowser);
		return () =>
			globalThis.removeEventListener(
				"keydown",
				onKeyDown,
				beforeXtermAndBrowser,
			);
	}, [open]);
}
