import { type SchemaNode, unwrapSchemaNode } from "./unwrapSchemaNode";

export type ConfigLeafType =
	| "string"
	| "number"
	| "boolean"
	| "enum"
	| "union"
	| "array"
	| "record"
	| "other";

export type ConfigScalarLeafType = "string" | "number" | "boolean" | "enum";

const LEAF_TYPES: Record<string, ConfigLeafType> = {
	string: "string",
	number: "number",
	boolean: "boolean",
	enum: "enum",
	array: "array",
	record: "record",
};

const SCALAR_LEAF_TYPES = new Set<ConfigLeafType>([
	"string",
	"number",
	"boolean",
	"enum",
]);

export function leafTypeOf(node: SchemaNode): ConfigLeafType {
	return LEAF_TYPES[node.def?.type ?? ""] ?? "other";
}

export function isScalarLeafType(
	type: ConfigLeafType,
): type is ConfigScalarLeafType {
	return SCALAR_LEAF_TYPES.has(type);
}

export function scalarUnionMembers(
	node: SchemaNode,
): ConfigScalarLeafType[] | undefined {
	const options = node.def?.options;
	if (node.def?.type !== "union" || !options?.length) return undefined;
	const members: ConfigScalarLeafType[] = [];
	for (const option of options) {
		const type = leafTypeOf(unwrapSchemaNode(option).inner);
		if (!isScalarLeafType(type)) return undefined;
		members.push(type);
	}
	return members;
}
