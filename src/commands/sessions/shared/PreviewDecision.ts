import type { PrPreviewComment } from "./SessionInfoBase";

export type PreviewSelection = {
	topLeft: string;
	bottomRight: string;
};

export type PreviewDecision = {
	decision: "approve" | "reject";
	reason?: string;
	comments?: PrPreviewComment[];
	screenshots?: string[];
	body?: string;
	reviewAfter?: boolean;
	announceAfter?: boolean;
	draft?: boolean;
	selection?: PreviewSelection;
};
