import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { configScopeFiles } from "./configScopeFiles";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	scope: ConfigScope;
	disabled: boolean;
	lockedToGlobal: boolean;
	scopesWithValue: ConfigScope[];
	repoKey?: string;
	onChange: (scope: ConfigScope) => void;
};

export function ConfigScopeToggle({
	scope,
	disabled,
	lockedToGlobal,
	scopesWithValue,
	repoKey,
	onChange,
}: Props) {
	const files = configScopeFiles(repoKey);
	const title = (candidate: ConfigScope): string => {
		if (lockedToGlobal && candidate !== "global") return "Global-only key";
		const presence = scopesWithValue.includes(candidate)
			? "Set in"
			: "Not set in";
		return `${presence} ${files[candidate]}`;
	};

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
				title={title("project")}
			>
				Project
			</ToggleButton>
			<ToggleButton
				value="repo"
				disabled={lockedToGlobal}
				title={title("repo")}
			>
				This repo
			</ToggleButton>
			<ToggleButton value="global" title={title("global")}>
				Global
			</ToggleButton>
		</ToggleButtonGroup>
	);
}
