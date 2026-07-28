import { describeConfigNode } from "../../shared/describeConfigNode";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { restoreConfigSecrets } from "../../shared/restoreConfigSecrets";
import { assistConfigSchema } from "../../shared/types";
import { configEntryNode } from "./configEntryNode";
import { getNestedValue } from "./getNestedValue";

export function restoreConfigWriteSecrets(
	key: string,
	value: unknown,
	cwd: string,
): unknown {
	const node = configEntryNode(describeConfigNode(assistConfigSchema), key);
	if (!node) return value;
	const stored = loadConfigFrom(cwd) as unknown as Record<string, unknown>;
	return restoreConfigSecrets(value, getNestedValue(stored, key), node);
}
