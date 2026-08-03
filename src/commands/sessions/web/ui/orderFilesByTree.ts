import type { FileData } from "react-diff-view";
import { buildDiffFileTree, type DiffFileTreeNode } from "./buildDiffFileTree";
import { filePath } from "./FileDiff";

function treeFileKeys(nodes: DiffFileTreeNode[]): string[] {
	return nodes.flatMap((node) =>
		node.kind === "file" ? [node.fileKey] : treeFileKeys(node.children),
	);
}

export function orderFilesByTree(files: FileData[]): FileData[] {
	const order = new Map(
		treeFileKeys(buildDiffFileTree(files)).map((fileKey, index) => [
			fileKey,
			index,
		]),
	);

	return [...files].sort(
		(a, b) => (order.get(filePath(a)) ?? 0) - (order.get(filePath(b)) ?? 0),
	);
}
