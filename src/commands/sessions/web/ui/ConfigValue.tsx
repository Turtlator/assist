import Typography from "@mui/material/Typography";
import type { ConfigEntry } from "../../../config/readConfigEntries";
import { formatConfigValue } from "./formatConfigValue";

export function ConfigValue({ entry }: { entry: ConfigEntry }) {
	if (entry.value === undefined) {
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
			sx={{
				m: 0,
				fontFamily: "monospace",
				whiteSpace: "pre-wrap",
				overflowWrap: "anywhere",
			}}
		>
			{formatConfigValue(entry.value)}
		</Typography>
	);
}
