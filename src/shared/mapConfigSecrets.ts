import type { ConfigNode } from "./ConfigNode";
import { configNodeField } from "./configNodeField";
import { isPlainRecord } from "./isPlainRecord";
import type { ConfigValuePath } from "./valueAtConfigPath";

type ConfigSecretMapper = (value: unknown, path: ConfigValuePath) => unknown;

type ChildNode = (name: string) => ConfigNode | undefined;

function mapChildren(
	value: unknown,
	path: ConfigValuePath,
	childNode: ChildNode,
	map: ConfigSecretMapper,
): unknown {
	if (!isPlainRecord(value)) return value;
	return Object.fromEntries(
		Object.entries(value).map(([name, child]) => [
			name,
			walk(child, [...path, name], childNode(name), map),
		]),
	);
}

function mapItems(
	value: unknown,
	path: ConfigValuePath,
	item: ConfigNode,
	map: ConfigSecretMapper,
): unknown {
	if (!Array.isArray(value)) return value;
	return value.map((entry, index) => walk(entry, [...path, index], item, map));
}

function walk(
	value: unknown,
	path: ConfigValuePath,
	node: ConfigNode | undefined,
	map: ConfigSecretMapper,
): unknown {
	if (!node || value === undefined || value === null) return value;
	if (node.secret) return map(value, path);
	switch (node.kind) {
		case "object":
		case "unionOfObjects":
			return mapChildren(
				value,
				path,
				(name) => configNodeField(node, name),
				map,
			);
		case "objectList":
			return mapItems(value, path, node.item, map);
		case "record":
			return mapChildren(value, path, () => node.value, map);
		default:
			return value;
	}
}

export function mapConfigSecrets(
	value: unknown,
	node: ConfigNode | undefined,
	map: ConfigSecretMapper,
): unknown {
	return walk(value, [], node, map);
}
