import type { z } from "zod";
import type {
	ConfigNode,
	ConfigNodeBase,
	ConfigOpaqueNode,
} from "./ConfigNode";
import type { ConfigPath } from "./formatConfigPath";
import { listConfigNode } from "./listConfigNode";
import { objectConfigNode, unionOfObjectsConfigNode } from "./objectConfigNode";
import { recordConfigNode } from "./recordConfigNode";
import { scalarConfigNode } from "./scalarConfigNode";
import { leafTypeOf } from "./scalarUnionMembers";
import { isSecretSchemaNode } from "./secretConfigValue";
import { type SchemaNode, unwrapSchemaNode } from "./unwrapSchemaNode";

function opaqueConfigNode(
	inner: SchemaNode,
	base: ConfigNodeBase,
): ConfigOpaqueNode {
	return { ...base, kind: "other", type: leafTypeOf(inner) };
}

function build(node: SchemaNode, path: ConfigPath): ConfigNode {
	const { inner, defaultValue, optional } = unwrapSchemaNode(node);
	const secret = isSecretSchemaNode(node) || isSecretSchemaNode(inner);
	const base: ConfigNodeBase = {
		path,
		...(optional ? { optional: true } : {}),
		...(defaultValue === undefined ? {} : { defaultValue }),
		...(secret ? { secret: true } : {}),
	};
	return (
		scalarConfigNode(inner, base) ??
		objectConfigNode(inner, base, build) ??
		listConfigNode(inner, base, build) ??
		recordConfigNode(inner, base, build) ??
		unionOfObjectsConfigNode(inner, base, build) ??
		opaqueConfigNode(inner, base)
	);
}

export function describeConfigNode(schema: z.ZodTypeAny): ConfigNode {
	return build(schema as unknown as SchemaNode, []);
}
