import { assertProjectScope } from "./assertProjectScope";
import { fetchProjectV2 } from "./fetchProjectV2";
import { normaliseTypeName } from "./fixStructure/normaliseTypeName";
import type { ProjectV2 } from "./readProject";

export type CreateIssueProject = {
	id: string;
	number: number;
	title: string;
	status?: {
		fieldId: string;
		optionId: string;
		optionName: string;
	};
};

export function parseProjectNumber(value: string): number {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0) {
		throw new Error(
			`--project takes a project number, not ${value}. It is the number in the project's URL, e.g. 1 for /orgs/acme/projects/1`,
		);
	}
	return number;
}

function resolveStatus(
	project: ProjectV2,
	statusName: string,
): NonNullable<CreateIssueProject["status"]> {
	const field = project.statusField;
	if (!field) {
		throw new Error(
			`Project ${project.number} (${project.title}) has no Status single-select field`,
		);
	}
	const wanted = normaliseTypeName(statusName);
	const option = field.options.find(
		(candidate) => normaliseTypeName(candidate.name) === wanted,
	);
	if (!option) {
		throw new Error(
			`Project ${project.number} (${project.title}) has no ${statusName} status. It has ${field.options.map((candidate) => candidate.name).join(", ")}`,
		);
	}
	return { fieldId: field.id, optionId: option.id, optionName: option.name };
}

export function resolveCreateIssueProject(
	owner: string,
	projectNumber: string,
	statusName: string | undefined,
): CreateIssueProject {
	assertProjectScope();
	const project = fetchProjectV2(owner, parseProjectNumber(projectNumber));
	return {
		id: project.id,
		number: project.number,
		title: project.title,
		status: statusName ? resolveStatus(project, statusName) : undefined,
	};
}
