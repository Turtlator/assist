const TOOLBAR_SELECTOR = 'markdown-toolbar, [role="toolbar"]';

/**
 * The nearest markdown toolbar above a textarea. GitHub nests the toolbar in a
 * sibling subtree rather than an ancestor of the field, so walk up and look down
 * from each ancestor, stopping at the form.
 */
export function findEditorToolbar(textarea: HTMLElement): HTMLElement | null {
	for (let node = textarea.parentElement; node; node = node.parentElement) {
		const toolbar = node.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
		if (toolbar) return toolbar;
		if (node.tagName === "FORM") break;
	}
	return null;
}
