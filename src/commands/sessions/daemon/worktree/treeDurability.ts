import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { gitOrNull } from "./git";

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
	const upstream = await gitOrNull(cwd, [
		"rev-parse",
		"--abbrev-ref",
		"--symbolic-full-name",
		"@{upstream}",
	]);
	if (upstream) {
		const ahead = await gitOrNull(cwd, [
			"rev-list",
			"--count",
			"@{upstream}..HEAD",
		]);
		return Number(ahead ?? "0") > 0;
	}
	const remoteBranches = await gitOrNull(cwd, [
		"branch",
		"-r",
		"--contains",
		"HEAD",
	]);
	return !remoteBranches;
}

async function collectTreeState(
	cwd: string,
	push: boolean,
): Promise<TreeState> {
	const status = await gitOrNull(cwd, ["status", "--porcelain"]);
	return {
		dirty: status !== null,
		push,
		localOnlyCommits: await hasLocalOnlyCommits(cwd),
	};
}

function pushOnCommit(cwd: string): boolean {
	try {
		return loadConfigFrom(cwd).commit.push;
	} catch {
		return false;
	}
}

export async function checkDurability(cwd: string): Promise<Durability> {
	return treeDurability(await collectTreeState(cwd, pushOnCommit(cwd)));
}
