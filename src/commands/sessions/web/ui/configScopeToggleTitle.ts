import { configScopeFiles } from "./configScopeFiles";
import { configScopeLabels } from "./configScopeLabels";
import type { ConfigScope } from "./saveConfigValue";

type Options = {
	scope: ConfigScope;
	scopesWithValue: ConfigScope[];
	repoKey: string | undefined;
	lockedToGlobal: boolean;
};

export function configScopeToggleTitle({
	scope,
	scopesWithValue,
	repoKey,
	lockedToGlobal,
}: Options): string {
	if (lockedToGlobal && scope !== "global") return "Global-only key";

	const where = configScopeFiles(repoKey)[scope];
	if (!scopesWithValue.includes(scope)) return `Not set in ${where}`;

	const effective = scopesWithValue[0];
	if (effective === scope) return `Set in ${where} — in effect`;
	return `Set in ${where} — overridden by ${configScopeLabels[effective]}`;
}
