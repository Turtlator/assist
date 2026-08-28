export type ProjectOwnerRoot = "organization" | "user";

export function projectV2Query(root: ProjectOwnerRoot): string {
	return `query($owner: String!, $number: Int!) {
	${root}(login: $owner) {
		projectV2(number: $number) {
			id
			title
			field(name: "Status") {
				... on ProjectV2SingleSelectField { id options { id name } }
			}
		}
	}
}`;
}
