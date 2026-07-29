import { findCurrentPrNumber } from "../prs/shared";

function currentPrNumber(): number | null {
	try {
		return findCurrentPrNumber();
	} catch (error) {
		console.error(
			`Error: could not confirm which PR this tree is on: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
		return null;
	}
}

export function stillOnReviewedPr(prNumber: number): boolean {
	const current = currentPrNumber();
	if (current === prNumber) return true;
	console.error(
		`Error: this tree is now on ${
			current === null ? "a branch with no open PR" : `PR #${current}`
		}, not the reviewed PR #${prNumber}; skipping the post and any chained sessions.`,
	);
	return false;
}
