import type { z } from "zod";
import { scalarArrayItemType } from "./scalarArrayItemType";
import {
	type ConfigLeafType,
	type ConfigScalarLeafType,
	leafTypeOf,
	scalarUnionMembers,
} from "./scalarUnionMembers";
import { type SchemaNode, unwrapSchemaNode } from "./unwrapSchemaNode";

export type ConfigLeaf = {
	key: string;
	type: ConfigLeafType;
	enumValues?: string[];
	unionTypes?: ConfigScalarLeafType[];
	itemType?: ConfigScalarLeafType;
	defaultValue?: unknown;
};

function enumValues(node: SchemaNode): string[] | undefined {
	const entries = node.def?.entries;
	if (!entries) return undefined;
	return Object.values(entries).filter(
		(value): value is string => typeof value === "string",
	);
}

function toLeaf(
	key: string,
	node: SchemaNode,
	defaultValue: unknown,
): ConfigLeaf {
	const unionTypes = scalarUnionMembers(node);
	const type = unionTypes ? "union" : leafTypeOf(node);
	const leaf: ConfigLeaf = { key, type };
	if (type === "enum") leaf.enumValues = enumValues(node);
	if (unionTypes) leaf.unionTypes = unionTypes;
	const itemType = scalarArrayItemType(node);
	if (itemType) leaf.itemType = itemType;
	if (defaultValue !== undefined) leaf.defaultValue = defaultValue;
	return leaf;
}

function collect(node: SchemaNode, prefix: string, out: ConfigLeaf[]): void {
	const { inner, defaultValue } = unwrapSchemaNode(node);
	const shape = inner.def?.shape;
	if (inner.def?.type === "object" && shape) {
		for (const [key, child] of Object.entries(shape)) {
			collect(child, prefix ? `${prefix}.${key}` : key, out);
		}
		return;
	}
	out.push(toLeaf(prefix, inner, defaultValue));
}

export function describeConfigLeaves(schema: z.ZodTypeAny): ConfigLeaf[] {
	const out: ConfigLeaf[] = [];
	collect(schema as unknown as SchemaNode, "", out);
	return out.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}
