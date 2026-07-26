const UNIT_MS = { s: 1_000, m: 60_000, h: 3_600_000 } as const;

export function parseDuration(value: string): number {
	const match = /^(\d+)(s|m|h)$/.exec(value.trim());
	if (!match) {
		throw new Error(
			`Invalid duration "${value}". Use a whole number followed by s, m, or h (e.g. 30s, 60m, 2h).`,
		);
	}

	const amount = Number(match[1]);
	if (amount === 0) {
		throw new Error(`Invalid duration "${value}". Value must be at least 1.`);
	}

	return amount * UNIT_MS[match[2] as keyof typeof UNIT_MS];
}
