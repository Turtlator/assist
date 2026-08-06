import type { ConfigLeaf } from "../../shared/describeConfigLeaves";
import { SECRET_MASK } from "../../shared/maskConfigSecrets";

export function formatConfigDefault(leaf: ConfigLeaf): string {
	if (leaf.defaultValue === undefined) return "unset";
	if (leaf.secret) return SECRET_MASK;
	return typeof leaf.defaultValue === "object"
		? JSON.stringify(leaf.defaultValue)
		: String(leaf.defaultValue);
}
