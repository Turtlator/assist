type PhaseSection = {
	name: string;
	tasks: string[];
	manualChecks?: string[];
};

export function renderPhaseSection(phase: PhaseSection, idx: number): string {
	const parts = [
		`### Phase ${idx + 1}: ${phase.name}`,
		phase.tasks.map((task) => `- ${task}`).join("\n"),
	];

	const manualChecks = phase.manualChecks ?? [];
	if (manualChecks.length > 0)
		parts.push(
			"**Manual checks:**",
			manualChecks.map((check) => `- ${check}`).join("\n"),
		);

	return parts.join("\n\n");
}
