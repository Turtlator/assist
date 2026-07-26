import {
	type ConfigScalarLeafType,
	isScalarLeafType,
	leafTypeOf,
} from "./scalarUnionMembers";
import { type SchemaNode, unwrapSchemaNode } from "./unwrapSchemaNode";

export function scalarArrayItemType(
	node: SchemaNode,
): ConfigScalarLeafType | undefined {
	const element = node.def?.element;
	if (node.def?.type !== "array" || !element) return undefined;
	const type = leafTypeOf(unwrapSchemaNode(element).inner);
	return isScalarLeafType(type) ? type : undefined;
}
