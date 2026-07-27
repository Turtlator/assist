import { isPrCheckoutArgs } from "./isPrCheckoutArgs";

const ITEM_ID = /^a?\d+$/;

export function isCommittingArgs(args: string[]): boolean {
	if (isPrCheckoutArgs(args)) return true;
	const [command, subcommand, ...rest] = args;
	if (command !== "backlog" || subcommand !== "run") return false;
	return rest.some((arg) => ITEM_ID.test(arg));
}
