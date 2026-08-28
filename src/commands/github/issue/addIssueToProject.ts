import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";

const MUTATION = `mutation($projectId: ID!, $contentId: ID!) {
	addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
		item { id }
	}
}`;

export function addIssueToProject(
	projectId: string,
	contentId: string,
): string {
	const raw = runGhGraphqlJson(MUTATION, { projectId, contentId });
	const id = (
		JSON.parse(raw) as {
			data?: {
				addProjectV2ItemById?: { item?: { id?: string } | null } | null;
			};
		}
	).data?.addProjectV2ItemById?.item?.id;
	if (!id) throw new Error("The project returned no item for the issue");
	return id;
}
