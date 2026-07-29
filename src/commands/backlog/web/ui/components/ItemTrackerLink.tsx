import type { ItemTracker } from "../types";
import { GithubIssueLink } from "./GithubIssueLink";
import { JiraKeyLink } from "./JiraKeyLink";
import type { TrackerLinkVariant } from "./TrackerLink";

type ItemTrackerLinkProps = {
	tracker?: ItemTracker;
	variant?: TrackerLinkVariant;
};

export function ItemTrackerLink({
	tracker,
	variant = "link",
}: ItemTrackerLinkProps) {
	if (tracker?.jiraKey)
		return <JiraKeyLink jiraKey={tracker.jiraKey} variant={variant} />;
	if (tracker?.githubIssue)
		return (
			<GithubIssueLink
				githubIssue={tracker.githubIssue}
				origin={tracker.origin}
				variant={variant}
			/>
		);
	return null;
}
