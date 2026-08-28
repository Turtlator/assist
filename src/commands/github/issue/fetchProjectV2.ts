import { type ProjectV2, readProject } from "./readProject";

export function fetchProjectV2(owner: string, number: number): ProjectV2 {
	const project =
		readProject(owner, number, "organization") ??
		readProject(owner, number, "user");
	if (!project) {
		throw new Error(`No project ${number} owned by ${owner} could be read`);
	}
	return project;
}
