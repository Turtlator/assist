import type { ConfigNode } from "./ConfigNode";
import { mapConfigSecrets } from "./mapConfigSecrets";
import { isRedactedSecret } from "./redactConfigSecrets";
import { valueAtConfigPath } from "./valueAtConfigPath";

export function restoreConfigSecrets(
	value: unknown,
	stored: unknown,
	node: ConfigNode | undefined,
): unknown {
	return mapConfigSecrets(value, node, (secret, path) =>
		isRedactedSecret(secret) ? valueAtConfigPath(stored, path) : secret,
	);
}
