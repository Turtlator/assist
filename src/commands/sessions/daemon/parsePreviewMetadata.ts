import type { PreviewMetadata } from "../shared/SessionInfoBase";

export function parsePreviewMetadata(
	value: unknown,
): PreviewMetadata[] | undefined {
	if (!Array.isArray(value)) return undefined;
	const items = value.flatMap((entry) => {
		const { label, value: text } = (entry ?? {}) as Record<string, unknown>;
		return typeof label === "string" && typeof text === "string"
			? [{ label, value: text }]
			: [];
	});
	return items.length > 0 ? items : undefined;
}
