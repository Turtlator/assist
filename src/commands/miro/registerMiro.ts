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
			"Widget id or ?moveToWidget=<id> link of the top-left box (omit both anchors to pick them in the assist web UI)",
		)
		.option(
			"--bottom-right <id>",
			"Widget id or ?moveToWidget=<id> link of the bottom-right box",
		)
		.option("--ignore <file>", "YAML list of box texts to drop from the output")
		.option("--out <file>", "Write the YAML to this file instead of stdout")
		.action(runExtract);
}
