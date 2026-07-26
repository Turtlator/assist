export type Movement = { from: string; to: string; count: number };

export function detectMovement(
	from: string,
	to: string,
	count: number,
): Movement | undefined {
	if (from === to) return undefined;
	if (!Number.isFinite(count) || count <= 0) return undefined;
	return { from, to, count };
}
