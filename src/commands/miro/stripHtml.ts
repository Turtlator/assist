const namedEntities: Record<string, string> = {
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	nbsp: " ",
	quot: '"',
};

function decodeEntity(_match: string, entity: string): string {
	if (entity.startsWith("#")) {
		const code =
			entity.startsWith("#x") || entity.startsWith("#X")
				? Number.parseInt(entity.slice(2), 16)
				: Number.parseInt(entity.slice(1), 10);
		return Number.isNaN(code) ? _match : String.fromCodePoint(code);
	}
	return namedEntities[entity.toLowerCase()] ?? _match;
}

export function stripHtml(content: string): string {
	return content
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<\/(?:p|div|li|h[1-6])>/gi, " ")
		.replace(/<[^>]*>/g, "")
		.replace(/&(#[0-9a-f]+|[a-z]+);/gi, decodeEntity)
		.replace(/\s+/g, " ")
		.trim();
}
