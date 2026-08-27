import type { DiffSelection } from "./finishDiffSelection";
import type { AddRuleRequest } from "./formatAddRuleCommand";
import type { DiffComment } from "./formatDiffComment";

export function diffSelectionActions({
	path,
	pending,
	clear,
	onComment,
	onAddRule,
}: {
	path: string;
	pending: DiffSelection | null;
	clear: () => void;
	onComment: (comment: DiffComment) => void;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
}): {
	add: (note: string) => void;
	addRule: ((note: string) => void) | undefined;
} {
	const add = (note: string) => {
		if (pending)
			onComment({
				path,
				startLine: pending.startLine,
				endLine: pending.endLine,
				quote: pending.quote,
				note,
			});
		clear();
	};

	const addRule = (note: string) => {
		if (pending && onAddRule) onAddRule({ path, quote: pending.quote, note });
		clear();
	};

	return { add, addRule: onAddRule ? addRule : undefined };
}
