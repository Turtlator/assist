import type { FileData, ViewType } from "react-diff-view";
import { DiffViewBody } from "./DiffViewBody";
import type { DiffComment } from "./formatDiffComment";
import { PageSpinner } from "./PageSpinner";

export function DiffContentBody({
	loading,
	files,
	treeVisible,
	viewType,
	cwd,
	onComment,
	emptyMessage,
}: {
	loading: boolean;
	files: FileData[];
	treeVisible: boolean;
	viewType: ViewType;
	cwd: string;
	onComment?: (comment: DiffComment) => void;
	emptyMessage: string;
}) {
	if (loading) return <PageSpinner />;

	return (
		<DiffViewBody
			files={files}
			treeVisible={treeVisible}
			viewType={viewType}
			cwd={cwd}
			onComment={onComment}
			emptyMessage={emptyMessage}
		/>
	);
}
