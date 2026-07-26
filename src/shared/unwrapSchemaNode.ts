const WRAPPER_TYPES = new Set([
	"optional",
	"default",
	"nullable",
	"nullish",
	"readonly",
	"catch",
]);

export type SchemaNode = {
	def?: {
		type?: string;
		innerType?: SchemaNode;
		shape?: Record<string, SchemaNode>;
		defaultValue?: unknown;
		entries?: Record<string, unknown>;
		options?: SchemaNode[];
		element?: SchemaNode;
	};
};

export function unwrapSchemaNode(node: SchemaNode): {
	inner: SchemaNode;
	defaultValue?: unknown;
} {
	let current = node;
	let defaultValue: unknown;
	while (
		current.def &&
		WRAPPER_TYPES.has(current.def.type ?? "") &&
		current.def.innerType
	) {
		if (current.def.type === "default" && defaultValue === undefined) {
			defaultValue = current.def.defaultValue;
		}
		current = current.def.innerType;
	}
	return { inner: current, defaultValue };
}
