export function isCompleted(
	previousPosition: number,
	currentPhase: number | undefined,
): boolean {
	return currentPhase !== undefined && previousPosition < currentPhase;
}
