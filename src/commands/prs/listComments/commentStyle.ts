import chalk from "chalk";
import { isClaudeCode } from "../../../lib/isClaudeCode";

export type Style = {
	cyan: (text: string) => string;
	bold: (text: string) => string;
	dim: (text: string) => string;
	state: (state: string) => string;
	diffHunk: boolean;
};

const plain = (text: string) => text;

function colouredState(state: string): string {
	const label = `[${state}]`;
	if (state === "APPROVED") return chalk.green(label);
	if (state === "CHANGES_REQUESTED") return chalk.red(label);
	return chalk.yellow(label);
}

export function commentStyle(): Style {
	if (isClaudeCode()) {
		return {
			cyan: plain,
			bold: plain,
			dim: plain,
			state: (state) => `[${state}]`,
			diffHunk: false,
		};
	}
	return {
		cyan: chalk.cyan,
		bold: chalk.bold,
		dim: chalk.dim,
		state: colouredState,
		diffHunk: true,
	};
}
