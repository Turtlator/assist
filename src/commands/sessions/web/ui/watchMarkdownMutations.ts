function anchorCount(node: Node): number {
	if (!(node instanceof Element)) return 0;
	return node.matches("a[href]") ? 1 : node.querySelectorAll("a[href]").length;
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
			const target = record.target;
			const inMarkdown =
				target instanceof Element && target.closest(".markdown") !== null;
			console.warn(
				"[linkdebug] DOM swap — anchors removed:",
				removed,
				"added:",
				added,
				"inside .markdown:",
				inMarkdown,
				"at",
				performance.now().toFixed(0),
			);
		}
	});
	observer.observe(document.body, { childList: true, subtree: true });
}
