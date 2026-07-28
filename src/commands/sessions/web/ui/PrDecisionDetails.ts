import type { PrPreviewComment } from "../../shared/SessionInfoBase";

export type PrDecisionDetails = {
	comments: PrPreviewComment[];
	screenshots: string[];
	reviewAfter: boolean;
};
