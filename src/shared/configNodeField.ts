import type { ConfigNode } from "./ConfigNode";
import { configNodeFieldName } from "./configNodeFieldName";

function fieldsOf(node: ConfigNode): ConfigNode[] {
	if (node.kind === "object") return node.fields;
	if (node.kind === "unionOfObjects")
		return node.variants.flatMap((variant) => variant.fields);
	return [];
}

export function configNodeField(
	node: ConfigNode,
	name: string,
): ConfigNode | undefined {
	const matches = fieldsOf(node).filter(
		(field) => configNodeFieldName(field) === name,
	);
	return matches.find((field) => field.secret) ?? matches[0];
}
