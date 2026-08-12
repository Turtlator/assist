import { runGhGraphql } from "../../shared/runGhGraphql";

const MUTATION_SINGLE = `mutation($prId: ID!, $body: String!, $path: String!, $line: Int!) { addPullRequestReviewThread(input: { pullRequestId: $prId, body: $body, path: $path, line: $line, side: RIGHT }) { thread { id } } }`;

const MUTATION_MULTI = `mutation($prId: ID!, $body: String!, $path: String!, $line: Int!, $startLine: Int!) { addPullRequestReviewThread(input: { pullRequestId: $prId, body: $body, path: $path, line: $line, startLine: $startLine, side: RIGHT, startSide: RIGHT }) { thread { id } } }`;

type CommentVars = {
	prId: string;
	body: string;
	path: string;
	line: number;
	startLine?: number;
};

function assertThreadCreated(stdout: string): void {
	let parsed: {
		data?: { addPullRequestReviewThread?: { thread?: { id?: unknown } } };
	};
	try {
		parsed = JSON.parse(stdout);
	} catch {
		throw new Error(`GitHub returned an unparseable response: ${stdout}`);
	}
	const id = parsed.data?.addPullRequestReviewThread?.thread?.id;
	if (typeof id !== "string" || id.length === 0) {
		throw new Error(
			"GitHub did not create a review thread (no thread id returned); the line is likely outside the PR diff.",
		);
	}
}

export function postReviewComment(vars: CommentVars): void {
	const { startLine, ...base } = vars;
	const stdout =
		startLine === undefined
			? runGhGraphql(MUTATION_SINGLE, base)
			: runGhGraphql(MUTATION_MULTI, { ...base, startLine });
	assertThreadCreated(stdout);
}
