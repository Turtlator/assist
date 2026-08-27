import type { Command } from "commander";
import { criteriaExtension } from "./criteriaExtension/criteriaExtension";
import { signCriteriaExtension } from "./criteriaExtension/signCriteriaExtension";

export function registerCriteriaExtension(program: Command): void {
	program
		.command("criteria-extension")
		.description(
			"Print the directory to load the acceptance criteria outliner browser extension from (load unpacked)",
		)
		.option(
			"--sign",
			"Sign the extension on AMO's unlisted channel and print the .xpi to install permanently in Firefox (needs WEB_EXT_API_KEY and WEB_EXT_API_SECRET)",
		)
		.action((options: { sign?: boolean }) =>
			options.sign ? signCriteriaExtension() : criteriaExtension(),
		);
}
