import { useState } from "react";
import { useSearchParams } from "react-router";
import { MarkdownBlock } from "../../../backlog/web/ui/components/MarkdownBlock";
import { FileLines } from "./FileLines";
import { type FileViewMode, FileViewHeader } from "./FileViewHeader";
import { fileViewMessage } from "./fileViewMessage";
import { PageShell } from "./PageShell";
import { languageForPath } from "./refractorHighlighter";
import { useFileContent } from "./useFileContent";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

export function FileView() {
	const [searchParams] = useSearchParams();
	const path = searchParams.get("path") ?? "";
	const { selectedCwd } = useRepoSelectionContext();
	const state = useFileContent(selectedCwd, path);
	const isMarkdown = languageForPath(path) === "markdown";
	const [mode, setMode] = useState<FileViewMode>("raw");

	return (
		<PageShell
			loading={state.status === "loading" && Boolean(selectedCwd && path)}
			isEmpty={state.status !== "ready"}
			emptyMessage={fileViewMessage(state.status, path, selectedCwd)}
			maxWidth={false}
		>
			<FileViewHeader
				path={path}
				mode={isMarkdown ? mode : undefined}
				onModeChange={setMode}
			/>
			{state.status === "ready" &&
				(isMarkdown && mode === "rendered" ? (
					<MarkdownBlock content={state.content} renderMermaid wide />
				) : (
					<FileLines content={state.content} path={path} />
				))}
		</PageShell>
	);
}
