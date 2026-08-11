import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { restoreConfigSecrets } from "../../shared/restoreConfigSecrets";
import { configKeyNode } from "./configKeyNode";
import { getNestedValue } from "./getNestedValue";

export function restoreConfigWriteSecrets(
	key: string,
	value: unknown,
	cwd: string,
	globalConfigPath?: string,
): unknown {
	const node = configKeyNode(key);
	if (!node) return value;
	const stored = loadConfigFrom(cwd, globalConfigPath) as unknown as Record<
		string,
		unknown
	>;
	return restoreConfigSecrets(value, getNestedValue(stored, key), node);
}
