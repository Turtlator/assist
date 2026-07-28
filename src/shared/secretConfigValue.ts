import { z } from "zod";
import type { SchemaNode } from "./unwrapSchemaNode";

const SECRET_META_KEY = "assistSecret";

export function secretConfigValue<T extends z.ZodType>(schema: T): T {
	return schema.meta({ [SECRET_META_KEY]: true }) as T;
}

export function isSecretSchemaNode(node: SchemaNode): boolean {
	const meta = z.globalRegistry.get(node as unknown as z.ZodType);
	return meta?.[SECRET_META_KEY] === true;
}
