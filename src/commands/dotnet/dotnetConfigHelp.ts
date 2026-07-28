import type { ConfigHelpEntry } from "../../shared/configHelp";

export const dotnetConfigHelp: ConfigHelpEntry[] = [
	{
		key: "dotnet.inspect.suppress",
		setter: "assist config set dotnet.inspect.suppress CSharpWarnings::CS0168",
		note: "inspection issue-type IDs suppressed by default",
	},
];
