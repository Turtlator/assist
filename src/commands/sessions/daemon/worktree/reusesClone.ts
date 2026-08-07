import { daemonLog } from "../daemonLog";
import { planAllocation } from "./planAllocation";
import { checkDurabilitySync } from "./treeDurability";

type ReuseOptions = {
	forCheckout?: boolean;
	draftLike?: boolean;
	includeDrafts?: boolean;
};

export function reusesClone(
	clone: string,
	boundTreeRoots: Set<string>,
	options: ReuseOptions,
): boolean {
	if (options.draftLike === true && options.includeDrafts !== true) {
		daemonLog(
			`draft-type session kept in the clone ${clone}: worktree.includeDrafts is off`,
		);
		return true;
	}
	if (planAllocation(clone, boundTreeRoots) !== "primary") {
		daemonLog(
			`clone ${clone} is held by a live session — spilling to a worktree`,
		);
		return false;
	}
	if (wouldDisturbWorkInProgress(clone, options.forCheckout === true))
		return false;
	daemonLog(
		`session kept in the clone ${clone}: no live session holds it${describeHolders(boundTreeRoots)}`,
	);
	return true;
}

function describeHolders(boundTreeRoots: Set<string>): string {
	if (boundTreeRoots.size === 0) return " and no tree is bound";
	return ` (bound trees: ${[...boundTreeRoots].join(", ")})`;
}

function wouldDisturbWorkInProgress(
	clone: string,
	forCheckout: boolean,
): boolean {
	if (!forCheckout) return false;
	const durability = checkDurabilitySync(clone);
	if (durability.durable) return false;
	daemonLog(
		`tree ${clone} not used for a PR checkout: ${durability.reason} — spilling to a worktree`,
	);
	return true;
}
