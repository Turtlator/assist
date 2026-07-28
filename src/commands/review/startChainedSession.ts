export async function startChainedSession(
	label: string,
	start: () => Promise<string>,
): Promise<void> {
	if (process.env.ASSIST_SESSION !== "1") return;
	try {
		await start();
		console.log(`Started ${label}.`);
	} catch (error) {
		console.error(
			`Warning: could not start ${label}: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
}
