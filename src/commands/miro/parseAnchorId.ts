export function parseAnchorId(value: string): string {
	const trimmed = value.trim();
	const link = /[?&]moveToWidget=([^&#]+)/.exec(trimmed);
	return link ? decodeURIComponent(link[1]).trim() : trimmed;
}
