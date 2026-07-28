import chalk from "chalk";

export function parsePhaseNumber(phase: string): number | undefined {
	const trimmed = phase.trim();
	if (!/^\d+$/.test(trimmed) || Number.parseInt(trimmed, 10) < 1) {
		console.log(
			chalk.red(
				`Invalid phase "${phase}". <phase> must be a phase number (1-based), not a phase name.`,
			),
		);
		process.exitCode = 1;
		return undefined;
	}
	return Number.parseInt(trimmed, 10);
}
