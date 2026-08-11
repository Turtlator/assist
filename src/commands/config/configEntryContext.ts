import type { ConfigNode } from "../../shared/ConfigNode";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { loadConfigFrom } from "../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../shared/types";
import { globalConfigFileLabel } from "./globalConfigFileLabel";
import {
	type RawConfigLayers,
	readRawConfigLayers,
} from "./readRawConfigLayers";

export type ConfigEntryContext = {
	config: Record<string, unknown>;
	layers: RawConfigLayers;
	globalConfigFile: string;
	schema: ConfigNode;
};

export function configEntryContext(
	cwd: string,
	globalConfigPath: string,
): ConfigEntryContext {
	return {
		config: loadConfigFrom(cwd, globalConfigPath) as unknown as Record<
			string,
			unknown
		>,
		layers: readRawConfigLayers(cwd, globalConfigPath),
		globalConfigFile: globalConfigFileLabel(globalConfigPath),
		schema: describeConfigNode(assistConfigSchema),
	};
}
