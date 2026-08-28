import { fetchIssueNodeId } from "./fetchIssueNodeId";
import type { IssueType } from "./fixStructure/types";
import { updateIssueType } from "./fixStructure/updateIssueType";
import { parseCreatedIssueUrl } from "./parseCreatedIssueUrl";

export function applyCreatedIssueType(
	createOutput: string,
	issueType: IssueType,
): void {
	try {
		const created = parseCreatedIssueUrl(createOutput);
		updateIssueType(fetchIssueNodeId(created), issueType.id);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(
			`The issue was created at ${createOutput.trim()}, but setting its issue type to ${issueType.name} failed: ${message}`,
		);
		process.exit(1);
	}
}
