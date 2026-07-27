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
	if (planAllocation(clone, boundTreeRoots) !== "primary") return false;
	return !wouldDisturbWorkInProgress(clone, options.forCheckout === true);
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
