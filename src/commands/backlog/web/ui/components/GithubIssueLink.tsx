import { githubIssueUrl } from "../../../../../shared/githubIssueUrl";
import { shortenGithubIssue } from "../../../shortenGithubIssue";
import { TrackerLink, type TrackerLinkVariant } from "./TrackerLink";

type GithubIssueLinkProps = {
	githubIssue?: string;
	origin?: string;
	variant?: TrackerLinkVariant;
};

export function GithubIssueLink({
	githubIssue,
	origin,
	variant = "link",
}: GithubIssueLinkProps) {
	if (!githubIssue) return null;
	return (
		<TrackerLink
			label={shortenGithubIssue(githubIssue, origin)}
			url={githubIssueUrl(githubIssue)}
			variant={variant}
		/>
	);
}
