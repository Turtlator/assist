import { acceptanceCriteriaState } from "../sessions/web/ui/acceptanceCriteriaState";
import { criteriaOutlineSurface } from "./criteriaOutlineSurface";
import { criteriaToggleButton } from "./criteriaToggleButton";
import { findEditorToolbar } from "./findEditorToolbar";

const ATTACHED = "data-assist-criteria-attached";

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

	const surface = criteriaOutlineSurface(textarea);

	function stopWaitingForBody(): void {
		textarea.removeEventListener("input", showOutlineWhenBodyArrives);
	}

	function showOutline(): void {
		stopWaitingForBody();
		surface.show();
		toggle.setOpen(true);
	}

	function showTextarea(): void {
		stopWaitingForBody();
		surface.hide();
		toggle.setOpen(false);
	}

	function showOutlineWhenBodyArrives(): void {
		if (outlinable(textarea.value)) showOutline();
	}

	const toggle = criteriaToggleButton((shown) =>
		shown ? showOutline() : showTextarea(),
	);
	placeButton(textarea, toggle.element);

	if (outlinable(textarea.value)) showOutline();
	else textarea.addEventListener("input", showOutlineWhenBodyArrives);
}
