export function stampManifestVersion(
	manifest: string,
	version: string,
): string {
	const parsed = JSON.parse(manifest) as Record<string, unknown>;
	return `${JSON.stringify({ ...parsed, version }, null, "\t")}\n`;
}
