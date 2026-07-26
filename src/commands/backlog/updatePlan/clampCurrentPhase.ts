export function clampCurrentPhase(
	currentPhase: number,
	phaseCount: number,
): number | null {
	if (phaseCount === 0) return null;
	return Math.min(currentPhase, phaseCount);
}
