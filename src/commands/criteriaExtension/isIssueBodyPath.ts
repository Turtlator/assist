const ISSUE_BODY_PATH = /^\/[^/]+\/[^/]+\/issues\/(?:\d+|new)(?:\/|$)/;

/**
 * Whether a github.com pathname is a surface that can hold an editable issue
 * body — an existing issue or the new-issue form. Comment editors and pull
 * request bodies live elsewhere, so gating on the path keeps the toggle off
 * every other page.
 */
export function isIssueBodyPath(pathname: string): boolean {
	return ISSUE_BODY_PATH.test(pathname);
}
