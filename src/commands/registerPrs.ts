import type { Command } from "commander";
import { configHelp } from "../shared/configHelp";
import { prs } from "./prs/index";
import { prsConfigHelp } from "./prs/prsConfigHelp";
import { registerPrsComments } from "./registerPrsComments";
import { registerPrsEdit } from "./registerPrsEdit";
import { registerPrsRaise } from "./registerPrsRaise";

export function registerPrs(program: Command): void {
	const prsCommand = program
		.command("prs")
		.description("Pull request utilities")
		.option("--open", "List only open pull requests")
		.option("--closed", "List only closed pull requests")
		.action(prs);

	registerPrsRaise(prsCommand);
	registerPrsEdit(prsCommand);
	registerPrsComments(prsCommand);

	configHelp(prsCommand, prsConfigHelp);
}
