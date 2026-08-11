import type { ConfigWriteScope } from "./ConfigWriteScope";

export function writesGlobalConfigFile(scope: ConfigWriteScope): boolean {
	return scope !== "project";
}
