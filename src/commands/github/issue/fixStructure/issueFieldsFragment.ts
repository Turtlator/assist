export const issueFieldsFragment = `fragment issueFields on Issue {
	id
	number
	title
	issueType { name }
	repository { nameWithOwner }
	labels(first: 100) { nodes { id name } pageInfo { hasNextPage } }
	subIssues(first: 100) { nodes { id } pageInfo { hasNextPage } }
}`;
