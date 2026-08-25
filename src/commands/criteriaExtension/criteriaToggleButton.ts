const BUTTON_STYLE = [
	"font: inherit",
	"font-size: 12px",
	"display: inline-flex",
	"align-items: center",
	"align-self: center",
	"line-height: 20px",
	"padding: 1px 8px",
	"margin: 0 4px",
	"border-radius: 6px",
	"border: 1px solid var(--borderColor-default, #d0d7de)",
	"background: var(--bgColor-muted, transparent)",
	"color: var(--fgColor-default, inherit)",
	"cursor: pointer",
].join(";");

const LABEL = { open: "Edit markdown", closed: "Outline criteria" } as const;

export function criteriaToggleButton(onToggle: (open: boolean) => void): {
	element: HTMLButtonElement;
	setOpen: (open: boolean) => void;
} {
	const element = document.createElement("button");
	element.type = "button";
	element.setAttribute("data-assist-criteria-toggle", "");
	element.style.cssText = BUTTON_STYLE;

	const setOpen = (open: boolean) => {
		element.setAttribute("aria-pressed", String(open));
		element.textContent = open ? LABEL.open : LABEL.closed;
	};

	setOpen(false);
	element.addEventListener("click", (event) => {
		event.preventDefault();
		const open = element.getAttribute("aria-pressed") !== "true";
		setOpen(open);
		onToggle(open);
	});
	return { element, setOpen };
}
