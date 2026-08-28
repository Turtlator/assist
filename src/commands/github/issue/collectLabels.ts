export function collectLabels(value: string, previous: string[]): string[] {
	const added = value
		.split(",")
		.map((label) => label.trim())
		.filter((label) => label.length > 0);
	return [...previous, ...added];
}
