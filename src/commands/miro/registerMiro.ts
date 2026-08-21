import type { Command } from "commander";
import { runExtract } from "./runExtract";

export function registerMiro(program: Command): void {
	const miroCommand = program
		.command("miro")
		.description("Miro board utilities");

	miroCommand
		.command("extract")
		.description("Print the text of every box inside a rectangle on a board")
		.option("--items <file>", "File of raw board_list_items response pages")
		.option(
			"--top-left <id>",
			"Widget id or ?moveToWidget=<id> link of the top-left box",
		)
		.option(
			"--bottom-right <id>",
			"Widget id or ?moveToWidget=<id> link of the bottom-right box",
		)
		.action(runExtract);
}
