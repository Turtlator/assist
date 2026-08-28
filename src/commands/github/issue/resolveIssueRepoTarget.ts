import { getRepoInfo } from "../../prs/shared";
import { parseRepoSlug } from "./parseRepoSlug";

export type IssueRepoTarget = {
	owner: string;
	repo: string;
};

export function resolveIssueRepoTarget(
	repo: string | undefined,
): IssueRepoTarget {
	if (!repo) {
		const info = getRepoInfo();
		return { owner: info.org, repo: info.repo };
	}
	return parseRepoSlug(repo);
}
