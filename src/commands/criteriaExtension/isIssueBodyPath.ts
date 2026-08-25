const ISSUE_BODY_PATH = /^\/[^/]+\/[^/]+\/issues\/\d+(?:\/|$)/;

/**
 * Whether a github.com pathname is a surface that can hold an editable issue
 * body. Comment editors and pull request bodies live elsewhere, so gating on the
 * path keeps the toggle off every other page.
 */
export function isIssueBodyPath(pathname: string): boolean {
	return ISSUE_BODY_PATH.test(pathname);
}
