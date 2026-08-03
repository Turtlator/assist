import { readStdin } from "../../lib/readStdin";
import { decideCommand } from "../cliHook/decideCommand";
import type { HookDecision } from "../cliHook/resolvePermission";
import { reportCodexStatus } from "./reportCodexStatus";

type CodexHookInput = {
	hook_event_name?: string;
	tool_name?: string;
	tool_input?: { command?: unknown };
};

const SUPPORTED_TOOLS = new Set(["Bash", "PowerShell"]);

type ParsedInput = { event: string; toolName?: string; command?: string };

function parseInput(raw: string): ParsedInput | undefined {
	try {
		const data: CodexHookInput = JSON.parse(raw);
		const event = data.hook_event_name ?? "PreToolUse";
		const command = data.tool_input?.command;
		if (typeof command !== "string" || !command.trim()) return { event };
		if (!data.tool_name || !SUPPORTED_TOOLS.has(data.tool_name))
			return { event };
		return { event, toolName: data.tool_name, command: command.trim() };
	} catch {
		return undefined;
	}
}

function preToolUseOutput(decision: HookDecision) {
	if (decision.permissionDecision === "allow") return undefined;
	return {
		hookSpecificOutput: {
			hookEventName: "PreToolUse",
			permissionDecision: "deny",
			permissionDecisionReason: decision.permissionDecisionReason,
		},
	};
}

function permissionRequestOutput(decision: HookDecision) {
	return {
		hookSpecificOutput: {
			hookEventName: "PermissionRequest",
			decision: {
				behavior: decision.permissionDecision === "allow" ? "allow" : "deny",
				message: decision.permissionDecisionReason,
			},
		},
	};
}

function decide(input: ParsedInput): HookDecision | undefined {
	if (!input.toolName || !input.command) return undefined;
	return decideCommand(input.toolName, input.command);
}

function outputFor(event: string, decision: HookDecision | undefined) {
	if (!decision) return undefined;
	if (event === "PermissionRequest") return permissionRequestOutput(decision);
	return preToolUseOutput(decision);
}

export async function codexHook(): Promise<void> {
	const input = parseInput(await readStdin());
	if (!input) return;

	const decision = decide(input);
	const output = outputFor(input.event, decision);
	if (output) console.log(JSON.stringify(output));

	await reportCodexStatus(input.event, decision !== undefined);
}
