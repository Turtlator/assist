import { writeFileSync } from "node:fs";
import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import {
	findConfigUp,
	getGlobalConfigPath,
	loadConfigFrom,
	projectConfigPathFrom,
} from "./loadConfigFrom";
import { loadRawYaml } from "./loadRawYaml";
import type { AssistConfig, TranscriptConfig } from "./types";

export function getProjectRoot(): string {
	const found = findConfigUp(process.cwd());
	return found?.rootDir ?? process.cwd();
}

export function loadConfig(): AssistConfig {
	return loadConfigFrom(process.cwd());
}

export function loadProjectConfig(
	cwd: string = process.cwd(),
): Record<string, unknown> {
	return loadRawYaml(projectConfigPathFrom(cwd));
}

export function loadGlobalConfigRaw(): Record<string, unknown> {
	return loadRawYaml(getGlobalConfigPath());
}

export function saveGlobalConfig(config: Record<string, unknown>): void {
	writeFileSync(getGlobalConfigPath(), stringifyYaml(config, { lineWidth: 0 }));
}

export function saveConfig(
	config: Record<string, unknown>,
	cwd: string = process.cwd(),
): void {
	const configPath = projectConfigPathFrom(cwd);
	writeFileSync(configPath, stringifyYaml(config, { lineWidth: 0 }));
}

export function getTranscriptConfig(): TranscriptConfig {
	const config = loadConfig();
	if (!config.transcript) {
		console.error(
			chalk.red(
				"Transcript directories not configured. Run 'assist transcript configure' first.",
			),
		);
		process.exit(1);
	}
	return config.transcript;
}
