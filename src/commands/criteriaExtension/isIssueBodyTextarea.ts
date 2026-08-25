const BODY_HINT = /issue.?body/i;
const COMMENT_HINT = /comment/i;

function hints(textarea: HTMLTextAreaElement): string[] {
	return [
		textarea.name,
		textarea.id,
		textarea.getAttribute("data-testid") ?? "",
		textarea.getAttribute("aria-label") ?? "",
	];
}

export function isIssueBodyTextarea(textarea: HTMLTextAreaElement): boolean {
	const values = hints(textarea);
	if (values.some((value) => COMMENT_HINT.test(value))) return false;
	return values.some((value) => BODY_HINT.test(value));
}
