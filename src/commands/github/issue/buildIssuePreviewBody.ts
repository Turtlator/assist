type IssuePreviewMetadata = {
	repo: string;
	type?: string;
};

export function buildIssuePreviewBody(
	metadata: IssuePreviewMetadata | undefined,
	body: string,
): string {
	if (!metadata) return body;
	const lines = [`**Repository:** ${metadata.repo}`];
	if (metadata.type) lines.push(`**Type:** ${metadata.type}`);
	return `${lines.join("\n")}\n\n---\n\n${body}`;
}
