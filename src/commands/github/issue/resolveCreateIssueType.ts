import { resolveIssueType } from "./fixStructure/resolveIssueType";
import { resolveOrgIssueTypes } from "./fixStructure/resolveOrgIssueTypes";
import type { IssueType } from "./fixStructure/types";
import {
	type IssueRepoTarget,
	resolveIssueRepoTarget,
} from "./resolveIssueRepoTarget";

export type CreateIssueType = {
	target: IssueRepoTarget;
	issueType: IssueType;
};

export function resolveCreateIssueType(
	typeName: string,
	repo: string | undefined,
): CreateIssueType {
	const target = resolveIssueRepoTarget(repo);
	const issueType = resolveIssueType(
		resolveOrgIssueTypes(target.owner),
		typeName,
	);
	return { target, issueType };
}
