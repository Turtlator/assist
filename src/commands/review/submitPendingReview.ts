import { runReviewSubmission } from "./runReviewSubmission";

const MUTATION = `mutation($prId: ID!, $body: String) { submitPullRequestReview(input: { pullRequestId: $prId, event: COMMENT, body: $body }) { pullRequestReview { id } } }`;

export function submitPendingReview(body: string): void {
	runReviewSubmission(MUTATION, body);
}
