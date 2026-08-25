import type { Command } from "commander";
import { criteriaExtension } from "./criteriaExtension/criteriaExtension";

export function registerCriteriaExtension(program: Command): void {
	program
		.command("criteria-extension")
		.description(
			"Print the directory to load the acceptance criteria outliner browser extension from (load unpacked)",
		)
		.action(() => criteriaExtension());
}
