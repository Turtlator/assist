const SECTION = "## Acceptance criteria\n\n1.";

export function insertAcceptanceCriteria(body: string): string {
	const head = body.replace(/\n+$/, "");
	return head === "" ? SECTION : `${head}\n\n${SECTION}`;
}
