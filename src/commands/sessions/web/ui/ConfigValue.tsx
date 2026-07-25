import Typography from "@mui/material/Typography";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { effectiveConfigValue } from "./effectiveConfigValue";
import { formatConfigValue } from "./formatConfigValue";

export function ConfigValue({ entry }: { entry: ConfigEntry }) {
	const value = effectiveConfigValue(entry);
	const isDefault = entry.source === "default";

	if (value === undefined) {
		return (
			<Typography variant="body2" color="text.secondary">
				not set
			</Typography>
		);
	}
	return (
		<Typography
			component="pre"
			variant="body2"
			color={isDefault ? "text.secondary" : "text.primary"}
			sx={{
				m: 0,
				fontFamily: "monospace",
				whiteSpace: "pre-wrap",
				overflowWrap: "anywhere",
			}}
		>
			{formatConfigValue(value)}
		</Typography>
	);
}
