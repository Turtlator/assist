const APPLY_RE = /^assist\s+github\s+issue\s+fix-structure\b.*\s--apply\b/;

export function appliesFixStructure(command: string): boolean {
	return APPLY_RE.test(command);
}
