import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import type { PendingComment } from "./PendingComment";
import type { PrPreviewChain } from "./PrPreviewChain";
import type { LocalComment } from "./usePrComments";

export type PrPreviewFooterProps = {
	comments: LocalComment[];
	commentColors: string[];
	pending: PendingComment | null;
	onAdd: (note: string) => void;
	onRemove: (id: number) => void;
	onCancel: () => void;
	onCollapse: () => void;
	onDecision: (
		decision: "approve" | "reject",
		comments: PrPreviewComment[],
	) => void;
	chain?: PrPreviewChain | undefined;
	editable: boolean;
	newPr: boolean;
	onChainChange: (chain: PrPreviewChain) => void;
};
