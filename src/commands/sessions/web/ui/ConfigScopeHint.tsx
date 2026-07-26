import Typography from "@mui/material/Typography";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { configScopeSummary } from "./configScopeSummary";
import type { ConfigScope } from "./saveConfigValue";

export function ConfigScopeHint({
	entry,
	scope,
}: {
	entry: ConfigEntry;
	scope: ConfigScope;
}) {
	return (
		<Typography variant="caption" color="text.secondary">
			{configScopeSummary(entry, scope)}
		</Typography>
	);
}
