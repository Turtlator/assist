import chalk from "chalk";
import { createItemWithDefaults } from "../createItemWithDefaults";
import { ensureRemoteOrigin } from "../ensureRemoteOrigin";
import { formatItemId } from "../formatItemId";
import type { BacklogType } from "../types";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./shared";

type AddOptions = {
	name?: string;
	type?: string;
	desc?: string;
	ac?: string[];
};

export async function add(options: AddOptions): Promise<void> {
	if (!ensureRemoteOrigin()) return;

	const type = (options.type as BacklogType) ?? (await promptType());
	const name = options.name ?? (await promptName());
	const description =
		options.desc?.replaceAll(String.raw`\n`, "\n") ??
		(await promptDescription());
	const acceptanceCriteria = options.ac ?? (await promptAcceptanceCriteria());

	const id = await createItemWithDefaults({
		type,
		name,
		description,
		acceptanceCriteria,
	});

	console.log(chalk.green(`Added item ${formatItemId(id)}: ${name}`));
}
