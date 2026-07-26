import type { ConfigNodeBase, ConfigScalarNode } from "./ConfigNode";
import {
	isScalarLeafType,
	leafTypeOf,
	scalarUnionMembers,
} from "./scalarUnionMembers";
import type { SchemaNode } from "./unwrapSchemaNode";

export function scalarConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
): ConfigScalarNode | undefined {
	const unionTypes = scalarUnionMembers(inner);
	if (unionTypes) return { ...base, kind: "scalar", type: "union", unionTypes };
	const type = leafTypeOf(inner);
	if (!isScalarLeafType(type)) return undefined;
	const values = type === "enum" ? enumValues(inner) : undefined;
	return {
		...base,
		kind: "scalar",
		type,
		...(values ? { enumValues: values } : {}),
	};
}

function enumValues(node: SchemaNode): string[] | undefined {
	const entries = node.def?.entries;
	if (!entries) return undefined;
	return Object.values(entries).filter(
		(value): value is string => typeof value === "string",
	);
}
