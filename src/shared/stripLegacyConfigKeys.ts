const legacyConfigKeys = ["news"];

export function stripLegacyConfigKeys(
	config: Record<string, unknown>,
): Record<string, unknown> {
	const stripped = { ...config };
	for (const key of legacyConfigKeys) delete stripped[key];
	return stripped;
}
