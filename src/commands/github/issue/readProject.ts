import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";
import { type ProjectOwnerRoot, projectV2Query } from "./projectV2Query";

export type ProjectV2 = {
	id: string;
	number: number;
	title: string;
	statusField?: {
		id: string;
		options: { id: string; name: string }[];
	};
};

type ProjectResponse = {
	data?: Partial<
		Record<
			ProjectOwnerRoot,
			{
				projectV2?: {
					id?: string;
					title?: string;
					field?: {
						id?: string;
						options?: { id: string; name: string }[];
					} | null;
				} | null;
			} | null
		>
	>;
};

export function readProject(
	owner: string,
	number: number,
	root: ProjectOwnerRoot,
): ProjectV2 | undefined {
	let raw: string;
	try {
		raw = runGhGraphqlJson(projectV2Query(root), { owner, number });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (
			root === "organization" &&
			message.includes("Could not resolve to an")
		) {
			return undefined;
		}
		throw error;
	}
	const project = (JSON.parse(raw) as ProjectResponse).data?.[root]?.projectV2;
	if (!project?.id) return undefined;
	const field = project.field;
	return {
		id: project.id,
		number,
		title: project.title ?? String(number),
		statusField: field?.id
			? { id: field.id, options: field.options ?? [] }
			: undefined,
	};
}
