const shorthand = /^([^/\s]+)\/([^/\s]+)#(\d+)$/;

export function githubIssueUrl(reference: string): string | undefined {
	const match = shorthand.exec(reference);
	if (!match) return undefined;
	const [, owner, repo, number] = match;
	return `https://github.com/${owner}/${repo}/issues/${number}`;
}
