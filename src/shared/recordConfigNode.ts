import type {
	BuildConfigNode,
	ConfigNodeBase,
	ConfigRecordNode,
} from "./ConfigNode";
import type { SchemaNode } from "./unwrapSchemaNode";

export function recordConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
	build: BuildConfigNode,
): ConfigRecordNode | undefined {
	const valueType = inner.def?.valueType;
	if (inner.def?.type !== "record" || !valueType) return undefined;
	const value = build(valueType, [...base.path, { kind: "entry" }]);
	return { ...base, kind: "record", value };
}
