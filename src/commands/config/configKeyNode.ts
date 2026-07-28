import type { ConfigNode } from "../../shared/ConfigNode";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { assistConfigSchema } from "../../shared/types";
import { configEntryNode } from "./configEntryNode";

export function configKeyNode(key: string): ConfigNode | undefined {
	return configEntryNode(describeConfigNode(assistConfigSchema), key);
}
