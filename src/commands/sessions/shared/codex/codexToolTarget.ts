import { toolTarget } from "../toolTarget";
import { rolloutString } from "./parseRolloutEntry";

export function codexToolTarget(payload: Record<string, unknown>): string {
	const args = parseArguments(payload.arguments);
	const target = args
		? commandText(args) || toolTarget(args) || rolloutString(args.input)
		: rolloutString(payload.input);
	return condense(target);
}

function commandText(args: Record<string, unknown>): string {
	const command = args.cmd ?? args.command;
	if (Array.isArray(command)) return command.map(rolloutString).join(" ");
	return rolloutString(command);
}

function parseArguments(value: unknown): Record<string, unknown> | null {
	if (typeof value !== "string") return null;
	try {
		const parsed: unknown = JSON.parse(value);
		return parsed && typeof parsed === "object"
			? (parsed as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

function condense(value: string): string {
	return value.replace(/\s+/g, " ").trim().slice(0, 120);
}
