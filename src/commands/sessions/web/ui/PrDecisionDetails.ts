import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PrPreviewChain } from "./PrPreviewChain";

export type PrDecisionDetails = PrPreviewChain & {
	comments: PrPreviewComment[];
	screenshots: string[];
};
