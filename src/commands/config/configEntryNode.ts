import type { ConfigNode } from "../../shared/ConfigNode";
import { findConfigNode } from "../../shared/findConfigNode";
import { parseConfigPath } from "../../shared/parseConfigPath";

export function configEntryNode(
	root: ConfigNode,
	key: string,
): ConfigNode | undefined {
	const path = parseConfigPath(key);
	return path ? findConfigNode(root, path) : undefined;
}
