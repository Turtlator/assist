import type { AssistConfig } from "../../shared/types";
import { upstreamBranch } from "../../shared/upstreamBranch";

export function shouldPull(config: AssistConfig): boolean {
	if (!config.commit?.pull) return false;
	if (upstreamBranch() !== null) return true;
	console.log("Skipping pull: this branch has no upstream to pull from");
	return false;
}
