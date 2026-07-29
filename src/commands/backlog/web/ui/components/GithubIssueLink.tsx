import { shortenGithubIssue } from "../../../shortenGithubIssue";
import { TrackerLink, type TrackerLinkVariant } from "./TrackerLink";

type GithubIssueLinkProps = {
	githubIssue?: string;
	origin?: string;
	variant?: TrackerLinkVariant;
};

const shorthand = /^([^/\s]+)\/([^/\s]+)#(\d+)$/;

function issueUrl(githubIssue: string): string | undefined {
	const match = shorthand.exec(githubIssue);
	if (!match) return undefined;
	const [, owner, repo, number] = match;
	return `https://github.com/${owner}/${repo}/issues/${number}`;
}

export function GithubIssueLink({
	githubIssue,
	origin,
	variant = "link",
}: GithubIssueLinkProps) {
	if (!githubIssue) return null;
	return (
		<TrackerLink
			label={shortenGithubIssue(githubIssue, origin)}
			url={issueUrl(githubIssue)}
			variant={variant}
		/>
	);
}
