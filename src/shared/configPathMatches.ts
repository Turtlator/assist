import type { ConfigPath, ConfigPathSegment } from "./formatConfigPath";

function segmentMatches(
	pattern: ConfigPathSegment,
	segment: ConfigPathSegment,
): boolean {
	if (pattern.kind === "item")
		return segment.kind === "item" || segment.kind === "index";
	if (pattern.kind === "entry")
		return segment.kind === "entry" || segment.kind === "key";
	if (pattern.kind === "key")
		return segment.kind === "key" && segment.name === pattern.name;
	return segment.kind === "index" && segment.index === pattern.index;
}

export function configPathMatches(
	pattern: ConfigPath,
	path: ConfigPath,
): boolean {
	if (pattern.length !== path.length) return false;
	return pattern.every((segment, index) =>
		segmentMatches(segment, path[index]),
	);
}
