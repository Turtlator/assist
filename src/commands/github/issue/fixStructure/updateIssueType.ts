import { runGhGraphqlJson } from "../../../../shared/runGhGraphqlJson";

const MUTATION = `mutation($issueId: ID!, $issueTypeId: ID!) {
	updateIssueIssueType(input: { issueId: $issueId, issueTypeId: $issueTypeId }) {
		issue { id }
	}
}`;

export function updateIssueType(issueId: string, issueTypeId: string): void {
	runGhGraphqlJson(MUTATION, { issueId, issueTypeId });
}
