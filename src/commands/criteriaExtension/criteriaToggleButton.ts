const BUTTON_STYLE = [
	"font: inherit",
	"font-size: 12px",
	"line-height: 20px",
	"padding: 1px 8px",
	"margin: 0 4px",
	"border-radius: 6px",
	"border: 1px solid var(--borderColor-default, #d0d7de)",
	"background: var(--bgColor-muted, transparent)",
	"color: var(--fgColor-default, inherit)",
	"cursor: pointer",
].join(";");

export function criteriaToggleButton(
	onToggle: (open: boolean) => void,
): HTMLButtonElement {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = "Outline criteria";
	button.setAttribute("data-assist-criteria-toggle", "");
	button.setAttribute("aria-pressed", "false");
	button.style.cssText = BUTTON_STYLE;
	button.addEventListener("click", (event) => {
		event.preventDefault();
		const open = button.getAttribute("aria-pressed") !== "true";
		button.setAttribute("aria-pressed", String(open));
		onToggle(open);
	});
	return button;
}
