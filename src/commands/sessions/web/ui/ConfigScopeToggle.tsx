import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	scope: ConfigScope;
	disabled: boolean;
	lockedToGlobal: boolean;
	onChange: (scope: ConfigScope) => void;
};

export function ConfigScopeToggle({
	scope,
	disabled,
	lockedToGlobal,
	onChange,
}: Props) {
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
			<ToggleButton
				value="project"
				disabled={lockedToGlobal}
				title={lockedToGlobal ? "Global-only key" : undefined}
			>
				Project
			</ToggleButton>
			<ToggleButton value="global">Global</ToggleButton>
		</ToggleButtonGroup>
	);
}
