import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	scope: ConfigScope;
	disabled: boolean;
	lockedToGlobal: boolean;
	scopesWithValue: ConfigScope[];
	onChange: (scope: ConfigScope) => void;
};

function presenceTitle(file: string, hasValue: boolean): string {
	return hasValue ? `Set in ${file}` : `Not set in ${file}`;
}

export function ConfigScopeToggle({
	scope,
	disabled,
	lockedToGlobal,
	scopesWithValue,
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
				title={
					lockedToGlobal
						? "Global-only key"
						: presenceTitle(
								"this repo's assist.yml",
								scopesWithValue.includes("project"),
							)
				}
			>
				Project
			</ToggleButton>
			<ToggleButton
				value="global"
				title={presenceTitle(
					"~/.assist.yml",
					scopesWithValue.includes("global"),
				)}
			>
				Global
			</ToggleButton>
		</ToggleButtonGroup>
	);
}
