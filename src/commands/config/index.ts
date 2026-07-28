import { stringify as stringifyYaml } from "yaml";
import { describeConfigNode } from "../../shared/describeConfigNode";
import { loadConfig } from "../../shared/loadConfig";
import { maskConfigSecrets } from "../../shared/maskConfigSecrets";
import { assistConfigSchema } from "../../shared/types";

export function configList(): void {
	const config = maskConfigSecrets(
		loadConfig(),
		describeConfigNode(assistConfigSchema),
	);
	console.log(stringifyYaml(config, { lineWidth: 0 }).trimEnd());
}
