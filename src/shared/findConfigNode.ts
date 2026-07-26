import type {
	ConfigNode,
	ConfigObjectNode,
	ConfigUnionOfObjectsNode,
} from "./ConfigNode";
import { configNodeFieldName } from "./configNodeFieldName";
import type { ConfigPath, ConfigPathSegment } from "./formatConfigPath";

function objectField(
	node: ConfigObjectNode,
	segment: ConfigPathSegment,
): ConfigNode | undefined {
	if (segment.kind !== "key") return undefined;
	return node.fields.find(
		(field) => configNodeFieldName(field) === segment.name,
	);
}

function variantField(
	node: ConfigUnionOfObjectsNode,
	segment: ConfigPathSegment,
): ConfigNode | undefined {
	for (const variant of node.variants) {
		const found = objectField(variant, segment);
		if (found) return found;
	}
	return undefined;
}

function step(
	node: ConfigNode,
	segment: ConfigPathSegment,
): ConfigNode | undefined {
	const intoItem = segment.kind === "item" || segment.kind === "index";
	const intoEntry = segment.kind === "entry" || segment.kind === "key";
	switch (node.kind) {
		case "object":
			return objectField(node, segment);
		case "unionOfObjects":
			return variantField(node, segment);
		case "objectList":
		case "scalarList":
			return intoItem ? node.item : undefined;
		case "record":
			return intoEntry ? node.value : undefined;
		default:
			return undefined;
	}
}

export function findConfigNode(
	root: ConfigNode,
	path: ConfigPath,
): ConfigNode | undefined {
	let current: ConfigNode | undefined = root;
	for (const segment of path) {
		if (!current) return undefined;
		current = step(current, segment);
	}
	return current;
}
