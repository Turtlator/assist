import type { ConfigScope } from "./saveConfigValue";

export function configScopeFiles(
	repoKey: string | undefined,
): Record<ConfigScope, string> {
	return {
		project: "this repo's assist.yml",
		repo: repoKey
			? `repos.${repoKey} in ~/.assist.yml`
			: "this repo's entry under repos: in ~/.assist.yml",
		global: "~/.assist.yml",
	};
}
