import { getGlobalConfigPath } from "../../shared/loadConfigFrom";

const WINDOWS_MOUNT_PREFIX = "/mnt/";

export function globalConfigFileLabel(path: string): string {
	if (path === getGlobalConfigPath()) return "~/.assist.yml";
	if (path.startsWith(WINDOWS_MOUNT_PREFIX))
		return `${path} on the Windows host`;
	return path;
}
