import { enumerateConfigLeafKeys } from "../../shared/enumerateConfigLeafKeys";
import { assistConfigSchema } from "../../shared/types";

export function isKnownConfigKey(key: string): boolean {
	return enumerateConfigLeafKeys(assistConfigSchema).includes(key);
}
