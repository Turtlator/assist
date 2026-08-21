import { validateProposedContent } from "../../../shared/validateProposedContent";

export function validateIssueBody(title: string, body: string): void {
	validateProposedContent(
		{ subject: "Issue", context: "GitHub issues" },
		title,
		body,
	);
}
