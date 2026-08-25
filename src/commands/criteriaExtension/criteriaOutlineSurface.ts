import type { Root } from "react-dom/client";
import { mountCriteriaOutline } from "./mountCriteriaOutline";
import { setTextareaValue } from "./setTextareaValue";

const HOST_STYLE = "display:block;width:100%;flex:1 1 auto;align-self:stretch";

export function criteriaOutlineSurface(textarea: HTMLTextAreaElement): {
	show: () => void;
	hide: () => void;
} {
	let host: HTMLElement | null = null;
	let root: Root | null = null;

	return {
		show() {
			host = document.createElement("div");
			host.style.cssText = HOST_STYLE;
			textarea.parentElement?.insertBefore(host, textarea.nextSibling);
			textarea.style.display = "none";
			root = mountCriteriaOutline(host, textarea.value, (body) =>
				setTextareaValue(textarea, body),
			);
		},
		hide() {
			root?.unmount();
			root = null;
			host?.remove();
			host = null;
			textarea.style.display = "";
		},
	};
}
