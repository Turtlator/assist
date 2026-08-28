const REPO_SLUG = /^([^/\s]+)\/([^/\s]+)$/;

export function parseRepoSlug(repo: string): { owner: string; repo: string } {
	const slug = REPO_SLUG.exec(repo.trim());
	if (!slug) {
		throw new Error(`--repo must be owner/repo, not "${repo}"`);
	}
	return { owner: slug[1] ?? "", repo: slug[2] ?? "" };
}
