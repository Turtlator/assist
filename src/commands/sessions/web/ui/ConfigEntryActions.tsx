import Stack from "@mui/material/Stack";
import { ConfigActionButton } from "./ConfigActionButton";
import {
	type ConfigEntryActionOptions,
	configEntryActionButtons,
} from "./configEntryActionButtons";

export function ConfigEntryActions(props: ConfigEntryActionOptions) {
	return (
		<Stack direction="row" sx={{ flexShrink: 0 }}>
			{configEntryActionButtons(props).map((button) => (
				<ConfigActionButton key={button.label} {...button} />
			))}
		</Stack>
	);
}
