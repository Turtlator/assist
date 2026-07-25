import { existsSync } from "node:fs";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { gitResult } from "./git";

type TreeState = {
	dirty: boolean;
	push: boolean;
	localOnlyCommits: boolean;
};

type Durability = { durable: true } | { durable: false; reason: string };

export function treeDurability(state: TreeState): Durability {
	if (state.dirty) return { durable: false, reason: "uncommitted changes" };
	if (!state.push && state.localOnlyCommits)
		return { durable: false, reason: "unpushed commits" };
	return { durable: true };
}

async function hasLocalOnlyCommits(cwd: string): Promise<boolean> {
	const upstream = await gitResult(cwd, [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{upstream}",
	]);
	if (upstream.ok && upstream.out) {
		const ahead = await gitResult(cwd, [
			"rev-list",
			"--count",
			"@{upstream}..HEAD",
		]);
		return !ahead.ok || Number(ahead.out) > 0;
	}
	const remoteBranches = await gitResult(cwd, [
		"branch",
		"-r",
		"--contains",
		"HEAD",
	]);
	return !remoteBranches.ok || remoteBranches.out === "";
}

function pushOnCommit(cwd: string): boolean {
	try {
		return loadConfigFrom(cwd).commit.push;
	} catch {
		return false;
	}
}

export async function checkDurability(cwd: string): Promise<Durability> {
	if (!existsSync(cwd)) return { durable: true };
	const status = await gitResult(cwd, ["status", "--porcelain"]);
	if (!status.ok)
		return { durable: false, reason: `tree state unreadable: ${status.error}` };
	return treeDurability({
		dirty: status.out !== "",
		push: pushOnCommit(cwd),
		localOnlyCommits: await hasLocalOnlyCommits(cwd),
	});
}
