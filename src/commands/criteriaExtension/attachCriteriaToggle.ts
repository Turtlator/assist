import type { Root } from "react-dom/client";
import { acceptanceCriteriaState } from "../sessions/web/ui/acceptanceCriteriaState";
import { criteriaToggleButton } from "./criteriaToggleButton";
import { findEditorToolbar } from "./findEditorToolbar";
import { mountCriteriaOutline } from "./mountCriteriaOutline";
import { setTextareaValue } from "./setTextareaValue";

const ATTACHED = "data-assist-criteria-attached";
const HOST_STYLE = "display:block;width:100%;flex:1 1 auto;align-self:stretch";

function placeButton(
	textarea: HTMLTextAreaElement,
	button: HTMLButtonElement,
): void {
	const toolbar = findEditorToolbar(textarea);
	if (toolbar) toolbar.append(button);
	else textarea.parentElement?.insertBefore(button, textarea);
}

function outlinable(body: string): boolean {
	return acceptanceCriteriaState(body).kind === "outline";
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
		host.style.cssText = HOST_STYLE;
		textarea.parentElement?.insertBefore(host, textarea.nextSibling);
		textarea.style.display = "none";
		root = mountCriteriaOutline(host, textarea.value, (body) =>
			setTextareaValue(textarea, body),
		);
	};

	const toggle = criteriaToggleButton((shown) => (shown ? open() : close()));
	placeButton(textarea, toggle.element);

	const autoOpen = () => {
		if (!outlinable(textarea.value)) return;
		open();
		toggle.setOpen(true);
	};

	// why: GitHub sometimes mounts the textarea before React fills it in, so an
	// empty field gets one more chance once its value arrives
	if (textarea.value === "")
		textarea.addEventListener("input", autoOpen, { once: true });
	else autoOpen();
}
