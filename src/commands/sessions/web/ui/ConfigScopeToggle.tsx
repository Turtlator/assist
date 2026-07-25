import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	scope: ConfigScope;
	disabled: boolean;
	onChange: (scope: ConfigScope) => void;
};

export function ConfigScopeToggle({ scope, disabled, onChange }: Props) {
	return (
		<ToggleButtonGroup
			size="small"
			exclusive
			value={scope}
			disabled={disabled}
			onChange={(_event, next: ConfigScope | null) => {
				if (next) onChange(next);
			}}
		>
			<ToggleButton value="project">Project</ToggleButton>
			<ToggleButton value="global">Global</ToggleButton>
		</ToggleButtonGroup>
	);
}
