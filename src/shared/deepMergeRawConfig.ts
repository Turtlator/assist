function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMergeRawConfig(
	base: Record<string, unknown>,
	override: Record<string, unknown>,
): Record<string, unknown> {
	const merged: Record<string, unknown> = { ...base };
	for (const [key, value] of Object.entries(override)) {
		const existing = merged[key];
		merged[key] =
			isPlainObject(existing) && isPlainObject(value)
				? deepMergeRawConfig(existing, value)
				: value;
	}
	return merged;
}
