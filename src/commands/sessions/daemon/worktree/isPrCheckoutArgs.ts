const CHECKOUT_COMMANDS = new Set([
	"review",
	"review-pr-comments",
	"fix-conflict",
]);

export function isPrCheckoutArgs(args: string[]): boolean {
	const [command, ...rest] = args;
	if (!command || !CHECKOUT_COMMANDS.has(command)) return false;
	return rest.some((arg) => /^[1-9]\d*$/.test(arg));
}
