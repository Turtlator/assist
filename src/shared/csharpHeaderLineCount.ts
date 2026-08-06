function closesBlock(trimmed: string, from: number): boolean {
	return trimmed.includes("*/", from);
}

export function csharpHeaderLineCount(content: string): number {
	const lines = content.split("\n");
	let count = 0;
	let inBlock = false;

	while (count < lines.length) {
		const trimmed = lines[count].trim();
		if (inBlock) {
			inBlock = !closesBlock(trimmed, 0);
		} else if (trimmed.startsWith("/*")) {
			inBlock = !closesBlock(trimmed, 2);
		} else if (trimmed !== "" && !trimmed.startsWith("//")) {
			break;
		}
		count++;
	}

	return count;
}
