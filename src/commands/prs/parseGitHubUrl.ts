const GITHUB_URL_PATTERN =
	/(?:git@github\.com:|https:\/\/github\.com\/)([^/]+)\/([^/]+?)(?:\.git)?\/?$/;

export function parseGitHubUrl(
	url: string,
): { org: string; repo: string } | null {
	const match = url.match(GITHUB_URL_PATTERN);
	if (!match) return null;
	return { org: match[1], repo: match[2] };
}
