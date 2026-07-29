import { useState } from "react";
import { useSearchParams } from "react-router";
import { MarkdownBlock } from "../../../backlog/web/ui/components/MarkdownBlock";
import { type FileViewMode, FileViewHeader } from "./FileViewHeader";
import { fileViewMessage } from "./fileViewMessage";
import { MonacoEditor } from "./MonacoEditor";
import { monacoLanguageForPath } from "./monacoLanguageForPath";
import { PageShell } from "./PageShell";
import { languageForPath } from "./refractorHighlighter";
import { useFileContent } from "./useFileContent";
import { useRepoSelectionContext } from "./useRepoSelectionContext";

const EDITOR_HEIGHT = "calc(100vh - 152px)";

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
					<MonacoEditor
						value={state.content}
						language={monacoLanguageForPath(path)}
						height={EDITOR_HEIGHT}
						readOnly
					/>
				))}
		</PageShell>
	);
}
