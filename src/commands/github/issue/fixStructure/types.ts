export type IssueLabel = {
	id: string;
	name: string;
};

export type SubtreeIssue = {
	id: string;
	number: number;
	title: string;
	repo: string;
	typeName: string | null;
	labels: IssueLabel[];
	childIds: string[];
};

export type PlacedIssue = SubtreeIssue & {
	depth: number;
	parentId: string | null;
};

export type IssueType = {
	id: string;
	name: string;
};

type PlannedTypeChange = {
	from: string | null;
	to: string;
	typeId: string;
};

export type PlanEntry = {
	issue: PlacedIssue;
	level: string | null;
	typeChange: PlannedTypeChange | null;
	labelRemovals: IssueLabel[];
};

export type TooDeepIssue = {
	issue: PlacedIssue;
	parent: PlacedIssue | null;
};

export type FixStructurePlan = {
	entries: PlanEntry[];
	tooDeep: TooDeepIssue[];
	typeChangeCount: number;
	labelRemovalCount: number;
};

export const defaultTypeChain = ["Epic", "Story", "Subtask"];
