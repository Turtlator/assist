import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import type { ConfigSource } from "../../../config/resolveConfigSource";

const DESCRIPTIONS: Record<ConfigSource, string> = {
	project: "Set in this repo's assist.yml",
	global: "Set in ~/.assist.yml",
	default: "Not set in any file — using the schema default",
};

export function ConfigSourceChip({ source }: { source: ConfigSource }) {
	return (
		<Tooltip title={DESCRIPTIONS[source]}>
			<Chip
				size="small"
				variant={source === "default" ? "outlined" : "filled"}
				color={source === "default" ? "default" : "primary"}
				label={source}
			/>
		</Tooltip>
	);
}
