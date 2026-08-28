import { readGhTokenScopes } from "./readGhTokenScopes";

export function assertProjectScope(): void {
	const scopes = readGhTokenScopes();
	if (!scopes || scopes.includes("project")) return;
	throw new Error(
		`The gh token has no project scope, so a project cannot be read or written. It has ${scopes.join(", ") || "no scopes"}. Run: gh auth refresh -h github.com -s project`,
	);
}
