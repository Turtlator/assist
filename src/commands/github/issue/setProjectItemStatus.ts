import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";

const MUTATION = `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
	updateProjectV2ItemFieldValue(input: {
		projectId: $projectId
		itemId: $itemId
		fieldId: $fieldId
		value: { singleSelectOptionId: $optionId }
	}) {
		projectV2Item { id }
	}
}`;

export function setProjectItemStatus(input: {
	projectId: string;
	itemId: string;
	fieldId: string;
	optionId: string;
}): void {
	runGhGraphqlJson(MUTATION, input);
}
