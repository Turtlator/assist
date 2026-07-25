export function buildManualCheckLines(
	manualChecks: string[],
	commitBeforeManualChecks: boolean,
): string[] {
	if (manualChecks.length > 0) {
		return [
			"",
			...(commitBeforeManualChecks
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
	return [];
}
