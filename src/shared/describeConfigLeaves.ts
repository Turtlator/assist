import type { z } from "zod";
import type { ConfigNode } from "./ConfigNode";
import { describeConfigNode } from "./describeConfigNode";
import { formatConfigPath } from "./formatConfigPath";
import type {
	ConfigLeafType,
	ConfigScalarLeafType,
} from "./scalarUnionMembers";

export type ConfigLeaf = {
	key: string;
	type: ConfigLeafType;
	enumValues?: string[];
	unionTypes?: ConfigScalarLeafType[];
	itemType?: ConfigScalarLeafType;
	defaultValue?: unknown;
	secret?: true;
};

function leafType(node: ConfigNode): ConfigLeafType {
	switch (node.kind) {
		case "scalar":
			return node.type;
		case "scalarList":
		case "objectList":
			return "array";
		case "record":
			return "record";
		case "other":
			return node.type;
		default:
			return "other";
	}
}

function toLeaf(node: ConfigNode): ConfigLeaf {
	const leaf: ConfigLeaf = {
		key: formatConfigPath(node.path),
		type: leafType(node),
	};
	if (node.kind === "scalar") {
		if (node.enumValues) leaf.enumValues = node.enumValues;
		if (node.unionTypes) leaf.unionTypes = node.unionTypes;
	}
	if (node.kind === "scalarList") leaf.itemType = node.itemType;
	if (node.defaultValue !== undefined) leaf.defaultValue = node.defaultValue;
	if (node.secret) leaf.secret = true;
	return leaf;
}

function flatten(node: ConfigNode, out: ConfigLeaf[]): void {
	if (node.kind === "object") {
		for (const field of node.fields) flatten(field, out);
		return;
	}
	out.push(toLeaf(node));
}

export function describeConfigLeaves(schema: z.ZodTypeAny): ConfigLeaf[] {
	const out: ConfigLeaf[] = [];
	flatten(describeConfigNode(schema), out);
	return out.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}
