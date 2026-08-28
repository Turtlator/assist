import { resolveIssueType } from "./fixStructure/resolveIssueType";
import { resolveOrgIssueTypes } from "./fixStructure/resolveOrgIssueTypes";
import type { IssueType } from "./fixStructure/types";
import {
	type IssueRepoTarget,
	resolveIssueRepoTarget,
} from "./resolveIssueRepoTarget";
import {
	type CreateIssueProject,
	resolveCreateIssueProject,
} from "./resolveCreateIssueProject";

export type CreateIssueMetadata = {
	target: IssueRepoTarget;
	issueType?: IssueType;
	project?: CreateIssueProject;
};

type CreateIssueMetadataOptions = {
	repo?: string;
	type?: string;
	project?: string;
	status?: string;
};

export function resolveCreateIssueMetadata(
	options: CreateIssueMetadataOptions,
): CreateIssueMetadata | undefined {
	if (!options.type && !options.project && !options.status) return undefined;
	if (options.status && !options.project) {
		throw new Error(
			"--status is a field on a project board, so it needs --project <number>",
		);
	}
	const target = resolveIssueRepoTarget(options.repo);
	return {
		target,
		issueType: options.type
			? resolveIssueType(resolveOrgIssueTypes(target.owner), options.type)
			: undefined,
		project: options.project
			? resolveCreateIssueProject(target.owner, options.project, options.status)
			: undefined,
	};
}
