import type { ConfigNode } from "./ConfigNode";
import { mapConfigSecrets } from "./mapConfigSecrets";

export const SECRET_MASK = "<hidden>";

export function maskConfigSecrets(
	value: unknown,
	node: ConfigNode | undefined,
): unknown {
	return mapConfigSecrets(value, node, () => SECRET_MASK);
}
