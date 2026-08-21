export function normaliseTypeName(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
