import type { Root } from "react-dom/client";
import { criteriaToggleButton } from "./criteriaToggleButton";
import { findEditorToolbar } from "./findEditorToolbar";
import { mountCriteriaOutline } from "./mountCriteriaOutline";
import { setTextareaValue } from "./setTextareaValue";

const ATTACHED = "data-assist-criteria-attached";

function placeButton(
	textarea: HTMLTextAreaElement,
	button: HTMLButtonElement,
): void {
	const toolbar = findEditorToolbar(textarea);
	if (toolbar) toolbar.append(button);
	else textarea.parentElement?.insertBefore(button, textarea);
}

export function attachCriteriaToggle(textarea: HTMLTextAreaElement): void {
	if (textarea.hasAttribute(ATTACHED)) return;
	textarea.setAttribute(ATTACHED, "");

	let host: HTMLElement | null = null;
	let root: Root | null = null;

	const close = () => {
		root?.unmount();
		root = null;
		host?.remove();
		host = null;
		textarea.style.display = "";
	};

	const open = () => {
		host = document.createElement("div");
		textarea.parentElement?.insertBefore(host, textarea.nextSibling);
		textarea.style.display = "none";
		root = mountCriteriaOutline(host, textarea.value, (body) =>
			setTextareaValue(textarea, body),
		);
	};

	placeButton(
		textarea,
		criteriaToggleButton((shown) => (shown ? open() : close())),
	);
}
