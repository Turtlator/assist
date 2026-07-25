import { existsSync } from "node:fs";
import { type GitResult, gitResult, gitSyncResult } from "./git";

type TreeState = {
	dirty: boolean;
	localOnlyCommits: boolean;
};

type Durability = { durable: true } | { durable: false; reason: string };

export function treeDurability(state: TreeState): Durability {
	if (state.dirty) return { durable: false, reason: "uncommitted changes" };
	if (state.localOnlyCommits)
		return { durable: false, reason: "unpushed commits" };
	return { durable: true };
}

function* durabilityProbes(): Generator<string[], Durability, GitResult> {
	const status = yield ["status", "--porcelain"];
	if (!status.ok)
		return { durable: false, reason: `tree state unreadable: ${status.error}` };
	const upstream = yield [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{upstream}",
	];
	let localOnlyCommits: boolean;
	if (upstream.ok && upstream.out) {
		const ahead = yield ["rev-list", "--count", "@{upstream}..HEAD"];
		localOnlyCommits = !ahead.ok || Number(ahead.out) > 0;
	} else {
		const remoteBranches = yield ["branch", "-r", "--contains", "HEAD"];
		localOnlyCommits = !remoteBranches.ok || remoteBranches.out === "";
	}
	return treeDurability({ dirty: status.out !== "", localOnlyCommits });
}

export async function checkDurability(cwd: string): Promise<Durability> {
	if (!existsSync(cwd)) return { durable: true };
	const probes = durabilityProbes();
	let step = probes.next();
	while (!step.done) step = probes.next(await gitResult(cwd, step.value));
	return step.value;
}

export function checkDurabilitySync(cwd: string): Durability {
	if (!existsSync(cwd)) return { durable: true };
	const probes = durabilityProbes();
	let step = probes.next();
	while (!step.done) step = probes.next(gitSyncResult(cwd, step.value));
	return step.value;
}
