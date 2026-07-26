import type {
	BuildConfigNode,
	ConfigNodeBase,
	ConfigObjectNode,
	ConfigUnionOfObjectsNode,
} from "./ConfigNode";
import type { SchemaNode } from "./unwrapSchemaNode";

export function objectConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
	build: BuildConfigNode,
): ConfigObjectNode | undefined {
	const shape = inner.def?.shape;
	if (inner.def?.type !== "object" || !shape) return undefined;
	const fields = Object.entries(shape).map(([name, child]) =>
		build(child, [...base.path, { kind: "key", name }]),
	);
	return { ...base, kind: "object", fields };
}

export function unionOfObjectsConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
	build: BuildConfigNode,
): ConfigUnionOfObjectsNode | undefined {
	const options = inner.def?.options;
	if (inner.def?.type !== "union" || !options?.length) return undefined;
	const variants: ConfigObjectNode[] = [];
	for (const option of options) {
		const variant = build(option, base.path);
		if (variant.kind !== "object") return undefined;
		variants.push(variant);
	}
	return { ...base, kind: "unionOfObjects", variants };
}
