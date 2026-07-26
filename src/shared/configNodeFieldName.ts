import type { ConfigNode } from "./ConfigNode";

export function configNodeFieldName(node: ConfigNode): string | undefined {
	const last = node.path.at(-1);
	return last?.kind === "key" ? last.name : undefined;
}
