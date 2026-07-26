import type { Command } from "commander";
import { configList } from "./config";
import { configGet } from "./config/configGet";
import { configSet } from "./config/configSet";
import { configUnset } from "./config/configUnset";

export function registerConfig(program: Command): void {
	const configCommand = program
		.command("config")
		.description("View and modify assist.yml configuration");

	configCommand
		.command("set <key> [value]")
		.description("Set a config value (e.g. commit.push true)")
		.option("-g, --global", "Write to global ~/.assist.yml")
		.option(
			"-r, --repo [name]",
			"Requires -g: scope the global write to a repo's identity (defaults to the current repo)",
		)
		.action((key, value, options) => configSet(key, value, options));

	configCommand
		.command("unset <key>")
		.description("Remove a config value (e.g. commit.push)")
		.option("-g, --global", "Remove from global ~/.assist.yml")
		.action((key, options) => configUnset(key, options));

	configCommand
		.command("get <key>")
		.description("Get a config value")
		.action(configGet);

	configCommand
		.command("list")
		.description("List all config values")
		.action(configList);
}
