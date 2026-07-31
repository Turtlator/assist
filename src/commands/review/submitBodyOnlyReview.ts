import { runReviewSubmission } from "./runReviewSubmission";

const MUTATION = `mutation($prId: ID!, $body: String) { addPullRequestReview(input: { pullRequestId: $prId, event: COMMENT, body: $body }) { pullRequestReview { id } } }`;

export function submitBodyOnlyReview(body: string): void {
	runReviewSubmission(MUTATION, body);
}
