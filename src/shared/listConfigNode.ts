import type {
	BuildConfigNode,
	ConfigNode,
	ConfigNodeBase,
	ConfigObjectListNode,
	ConfigScalarListNode,
} from "./ConfigNode";
import { scalarArrayItemType } from "./scalarArrayItemType";
import type { SchemaNode } from "./unwrapSchemaNode";

function scalarListNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
	item: ConfigNode,
): ConfigScalarListNode | undefined {
	const itemType = scalarArrayItemType(inner);
	if (!itemType || item.kind !== "scalar") return undefined;
	return { ...base, kind: "scalarList", itemType, item };
}

function objectListNode(
	base: ConfigNodeBase,
	item: ConfigNode,
): ConfigObjectListNode | undefined {
	if (item.kind !== "object" && item.kind !== "unionOfObjects")
		return undefined;
	return { ...base, kind: "objectList", item };
}

export function listConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
	build: BuildConfigNode,
): ConfigScalarListNode | ConfigObjectListNode | undefined {
	const element = inner.def?.element;
	if (inner.def?.type !== "array" || !element) return undefined;
	const item = build(element, [...base.path, { kind: "item" }]);
	return scalarListNode(inner, base, item) ?? objectListNode(base, item);
}
