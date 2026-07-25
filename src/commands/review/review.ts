import { emitActivity } from "../../shared/emitActivity";
import { findRepoRoot } from "../../shared/findRepoRoot";
import { checkoutPr } from "./checkoutPr";
import { reviewPr } from "./reviewPr";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	apply?: boolean;
	backlog?: boolean;
	verbose?: boolean;
	number?: string;
};

function resolveRepoRoot(): string {
	const repoRoot = findRepoRoot(process.cwd());
	if (repoRoot) return repoRoot;
	console.error("Error: not inside a git repository.");
	process.exit(1);
}

function validateOptions(options: ReviewOptions): void {
	if (options.apply && options.refine) {
		console.error("Error: --apply cannot be combined with --refine.");
		process.exit(1);
	}
	if (options.backlog && (options.refine || options.apply)) {
		console.error(
			"Error: --backlog cannot be combined with --refine or --apply.",
		);
		process.exit(1);
	}
}

export async function review(options: ReviewOptions = {}): Promise<void> {
	validateOptions(options);
	const invokedIn = resolveRepoRoot();
	emitActivity({ kind: "command", name: "review" });
	if (!options.number) return reviewPr(invokedIn, options);
	await checkoutPr(options.number);
	return reviewPr(resolveRepoRoot(), options);
}
