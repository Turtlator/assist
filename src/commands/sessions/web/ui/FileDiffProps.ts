import type { FileData, ViewType } from "react-diff-view";
import type { AddRuleRequest } from "./formatAddRuleCommand";
import type { DiffComment } from "./formatDiffComment";

export type FileDiffProps = {
	file: FileData;
	viewType: ViewType;
	cwd: string | undefined;
	collapsed: boolean;
	onToggle: () => void;
	onComment?: (comment: DiffComment) => void;
	onAddRule?: (request: AddRuleRequest) => void;
};
