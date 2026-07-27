export function changeKeyLine(key: string | null | undefined): number | null {
	const match = /^[NID](\d+)$/.exec(key ?? "");
	return match ? Number(match[1]) : null;
}
