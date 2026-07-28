import type { ConfigHelpEntry } from "../../shared/configHelp";

export const mermaidConfigHelp: ConfigHelpEntry[] = [
	{
		key: "mermaid.krokiUrl",
		setter: "assist config set mermaid.krokiUrl https://kroki.io",
		note: "Kroki server used to render diagrams (default: https://kroki.io)",
	},
];
