import type { parse } from "shell-quote";
import { consumeHeredoc } from "./consumeHeredoc";
import { consumeInputRedirect } from "./consumeInputRedirect";
import { consumeRedirect, type StepResult } from "./consumeRedirect";

type Tokens = ReturnType<typeof parse>;
type Token = Tokens[number];

type GroupResult =
	| { ok: true; groups: string[][] }
	| { ok: false; error: string };

const SEPARATOR_OPS = new Set(["|", "&&", "||", ";"]);
const OUTPUT_REDIRECT_OPS = new Set([">", ">>"]);
const INPUT_REDIRECT_OP = "<";
const UNPARSEABLE = { ok: false, error: "unable to parse" } as const;

/**
 * Group tokens into sub-command word arrays split on separator operators.
 * Strips output redirects when the target is under the OS temp directory, and
 * input redirects — including heredoc headers — regardless of source path.
 * Returns an error for unsafe operators, non-string tokens, or output redirects
 * pointing outside the OS temp directory.
 */
export function groupByOperator(tokens: Tokens): GroupResult {
	const groups: string[][] = [[]];
	for (let i = 0; i < tokens.length; i++) {
		const step = handleToken(tokens, i, groups);
		if (!step.ok) return step;
		i = step.nextIndex;
	}
	return { ok: true, groups };
}

function handleToken(
	tokens: Tokens,
	i: number,
	groups: string[][],
): StepResult {
	const token = tokens[i];
	const op = getOp(token);
	if (op === undefined) return appendWord(token, groups, i);
	if (op === "glob") {
		groups[groups.length - 1].push((token as { pattern: string }).pattern);
		return { ok: true, nextIndex: i };
	}
	if (SEPARATOR_OPS.has(op)) {
		groups.push([]);
		return { ok: true, nextIndex: i };
	}
	if (OUTPUT_REDIRECT_OPS.has(op)) {
		return consumeRedirect(tokens, i, groups[groups.length - 1]);
	}
	if (op === INPUT_REDIRECT_OP) {
		const current = groups[groups.length - 1];
		return getOp(tokens[i + 1]) === INPUT_REDIRECT_OP
			? consumeHeredoc(tokens, i, current)
			: consumeInputRedirect(tokens, i, current);
	}
	return UNPARSEABLE;
}

function appendWord(token: Token, groups: string[][], i: number): StepResult {
	if (typeof token !== "string") return UNPARSEABLE;
	groups[groups.length - 1].push(token);
	return { ok: true, nextIndex: i };
}

function getOp(token: Token): string | undefined {
	return typeof token === "object" && token !== null && "op" in token
		? (token as { op: string }).op
		: undefined;
}
