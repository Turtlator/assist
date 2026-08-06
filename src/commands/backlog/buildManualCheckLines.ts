export function buildManualCheckLines(
	manualChecks: string[],
	commitBeforePhaseEnd: boolean,
): string[] {
	if (manualChecks.length > 0) {
		return [
			"",
			...(commitBeforePhaseEnd
				? [
						"Once verify passes, run /commit to commit the work before asking the user to perform the manual checks below.",
					]
				: []),
			"Before marking this phase as done, ask the user to perform these manual checks:",
			...manualChecks.map((c) => `- ${c}`),
			"",
			"Wait for the user to confirm all manual checks pass before proceeding.",
		];
	}
	if (commitBeforePhaseEnd) {
		return [
			"",
			"Once verify passes, run /commit to commit the work before marking this phase as done.",
		];
	}
	return [];
}
