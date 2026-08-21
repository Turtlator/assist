type IgnoreOutcome = {
	texts: string[];
	unmatched: string[];
};

export function applyIgnore(texts: string[], ignore: string[]): IgnoreOutcome {
	const dropped = new Set(ignore);
	const present = new Set(texts);
	return {
		texts: texts.filter((text) => !dropped.has(text)),
		unmatched: [...new Set(ignore)].filter((entry) => !present.has(entry)),
	};
}
