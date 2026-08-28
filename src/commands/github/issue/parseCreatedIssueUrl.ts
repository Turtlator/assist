type CreatedIssue = {
	owner: string;
	repo: string;
	number: number;
	url: string;
};

const ISSUE_URL = /(https?:\/\/\S+?\/([^\s/]+)\/([^\s/]+)\/issues\/(\d+))\b/;

export function parseCreatedIssueUrl(output: string): CreatedIssue {
	const match = ISSUE_URL.exec(output);
	if (!match) {
		throw new Error(
			`gh issue create printed no issue URL, so the new issue could not be identified: ${output.trim()}`,
		);
	}
	return {
		url: match[1] ?? "",
		owner: match[2] ?? "",
		repo: match[3] ?? "",
		number: Number(match[4]),
	};
}
