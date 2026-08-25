const BODY_HINT = /issue.?body/i;
const DESCRIPTION_HINT = /description/i;
const COMMENT_HINT = /comment/i;

/**
 * GitHub's React issue editor gives the body textarea a generated id and no
 * name, so the only attribute separating it from the comment boxes on the same
 * page is its placeholder ("Type your description here…"). The `issue[body]` /
 * `issue_body` hints keep the older server-rendered forms matching too.
 */
export function isIssueBodyTextarea(textarea: HTMLTextAreaElement): boolean {
	const named = [
		textarea.name,
		textarea.id,
		textarea.getAttribute("data-testid") ?? "",
		textarea.getAttribute("aria-label") ?? "",
	];
	const placeholder = textarea.placeholder;
	if ([...named, placeholder].some((value) => COMMENT_HINT.test(value)))
		return false;
	return (
		named.some((value) => BODY_HINT.test(value)) ||
		DESCRIPTION_HINT.test(placeholder)
	);
}
