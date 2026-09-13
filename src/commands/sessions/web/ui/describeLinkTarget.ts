export function describeLinkTarget(el: EventTarget | null): string {
	if (!(el instanceof Element)) return String(el);
	const anchor = el.closest("a[href]");
	if (!anchor) return `${el.tagName} (no anchor ancestor)`;
	const attrs = ["href", "target", "rel"]
		.map((name) => `${name}=${JSON.stringify(anchor.getAttribute(name))}`)
		.join(" ");
	return `${el.tagName} inside <a ${attrs}>`;
}
