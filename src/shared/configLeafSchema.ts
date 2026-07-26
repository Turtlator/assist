import type { z } from "zod";
import { type SchemaNode, unwrapSchemaNode } from "./unwrapSchemaNode";

export function configLeafSchema(
	schema: z.ZodTypeAny,
	key: string,
): z.ZodTypeAny | undefined {
	let current = schema as unknown as SchemaNode;
	for (const name of key.split(".")) {
		const { inner } = unwrapSchemaNode(current);
		const child =
			inner.def?.type === "object" ? inner.def.shape?.[name] : undefined;
		if (!child) return undefined;
		current = child;
	}
	return current as unknown as z.ZodTypeAny;
}
