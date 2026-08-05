export function agentFooter(unresolvedCount: number): string {
	if (unresolvedCount === 0) return "No unresolved threads to process.";
	return "Every unresolved thread is printed in full above, with its author, path:line, id, url and body. Work from this output — do not read or parse the YAML cache; fixed, wontfix and reply locate it themselves.";
}
