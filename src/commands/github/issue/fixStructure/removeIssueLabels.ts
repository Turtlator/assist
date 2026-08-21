import { runGhGraphqlJson } from "../../../../shared/runGhGraphqlJson";

const MUTATION = `mutation($labelableId: ID!, $labelIds: [ID!]!) {
	removeLabelsFromLabelable(input: { labelableId: $labelableId, labelIds: $labelIds }) {
		labelable { __typename }
	}
}`;

export function removeIssueLabels(issueId: string, labelIds: string[]): void {
	runGhGraphqlJson(MUTATION, { labelableId: issueId, labelIds });
}
