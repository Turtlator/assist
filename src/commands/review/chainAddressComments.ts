import { requestAssistSession } from "../sessions/shared/requestAssistSession";

export async function chainAddressComments(prNumber: number): Promise<void> {
	if (process.env.ASSIST_SESSION !== "1") return;
	try {
		await requestAssistSession(
			["review-pr-comments", String(prNumber)],
			process.cwd(),
		);
		console.log(`Started an Address Comments session for PR #${prNumber}.`);
	} catch (error) {
		console.error(
			`Warning: could not start an Address Comments session: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
