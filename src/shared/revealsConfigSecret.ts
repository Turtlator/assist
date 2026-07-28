const REVEAL_RE = /^assist\s+config\s+get\b.*\s--reveal\b/;

export function revealsConfigSecret(command: string): boolean {
	return REVEAL_RE.test(command);
}
