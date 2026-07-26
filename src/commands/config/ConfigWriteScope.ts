export type ConfigWriteScope = "project" | "global" | "repo";

export function isConfigWriteScope(value: unknown): value is ConfigWriteScope {
	return value === "project" || value === "global" || value === "repo";
}
