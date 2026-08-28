type IssuePreviewMetadata = {
	repo: string;
	type?: string;
	project?: string;
	status?: string;
};

export function buildIssuePreviewBody(
	metadata: IssuePreviewMetadata | undefined,
	body: string,
): string {
	if (!metadata) return body;
	const lines = [`**Repository:** ${metadata.repo}`];
	if (metadata.type) lines.push(`**Type:** ${metadata.type}`);
	if (metadata.project) lines.push(`**Project:** ${metadata.project}`);
	if (metadata.status) lines.push(`**Status:** ${metadata.status}`);
	return `${lines.join("\n")}\n\n---\n\n${body}`;
}
