export function unclampSvgWidth(target: HTMLElement): void {
	const svg = target.querySelector("svg");
	if (!svg) return;
	const natural = /max-width:\s*([\d.]+)px/.exec(
		svg.getAttribute("style") ?? "",
	);
	if (!natural) return;
	svg.style.maxWidth = "none";
	svg.style.width = `${natural[1]}px`;
}
