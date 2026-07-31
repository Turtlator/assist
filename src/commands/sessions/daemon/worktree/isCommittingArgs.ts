import { isBacklogRunArgs } from "./isBacklogRunArgs";
import { isPrCheckoutArgs } from "./isPrCheckoutArgs";

export function isCommittingArgs(args: string[]): boolean {
	return isPrCheckoutArgs(args) || isBacklogRunArgs(args);
}
