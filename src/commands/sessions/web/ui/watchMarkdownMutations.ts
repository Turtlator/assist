function anchorCount(node: Node): number {
	if (!(node instanceof Element)) return 0;
	return node.matches("a[href]") ? 1 : node.querySelectorAll("a[href]").length;
}

function describeNode(node: Node): string {
	if (!(node instanceof Element)) return `#${node.nodeName}`;
	const id = node.id ? `#${node.id}` : "";
	const cls = node.className
		? `.${String(node.className).split(/\s+/).join(".")}`
		: "";
	return `${node.tagName}${id}${cls}`;
}

export function watchMarkdownMutations() {
	const observer = new MutationObserver((records) => {
		for (const record of records) {
			const removed = [...record.removedNodes].reduce(
				(n, node) => n + anchorCount(node),
				0,
			);
			const added = [...record.addedNodes].reduce(
				(n, node) => n + anchorCount(node),
				0,
			);
			if (removed === 0 && added === 0) continue;
			console.warn(
				"[linkdebug] DOM swap in",
				describeNode(record.target),
				"| removed:",
				[...record.removedNodes].map(describeNode).join(","),
				"| added:",
				[...record.addedNodes].map(describeNode).join(","),
				"| markdownAncestor:",
				record.target instanceof Element
					? record.target.closest(".markdown") !== null
					: false,
				"@",
				performance.now().toFixed(0),
			);
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
}
