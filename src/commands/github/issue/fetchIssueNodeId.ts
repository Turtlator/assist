import { runGhGraphqlJson } from "../../../shared/runGhGraphqlJson";

const QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
	repository(owner: $owner, name: $repo) {
		issue(number: $number) { id }
	}
}`;

export function fetchIssueNodeId(target: {
	owner: string;
	repo: string;
	number: number;
}): string {
	const raw = runGhGraphqlJson(QUERY, target);
	const id = (
		JSON.parse(raw) as {
			data?: { repository?: { issue?: { id?: string } | null } | null };
		}
	).data?.repository?.issue?.id;
	if (!id) {
		throw new Error(
			`No issue ${target.owner}/${target.repo}#${target.number} could be read`,
		);
	}
	return id;
}
