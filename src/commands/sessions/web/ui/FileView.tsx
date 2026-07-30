import { useState } from "react";
import { useSearchParams } from "react-router";
import { ErrorSnackbar } from "./ErrorSnackbar";
import { FileViewBody } from "./FileViewBody";
import { FileViewHeader } from "./FileViewHeader";
import type { FileViewMode } from "./FileViewMode";
import { fileViewMessage } from "./fileViewMessage";
import { PageShell } from "./PageShell";
import { languageForPath } from "./refractorHighlighter";
import { useFileBuffer } from "./useFileBuffer";
import { useFileContent } from "./useFileContent";
import { useRepoSelectionContext } from "./useRepoSelectionContext";
import { useSaveHotkey } from "./useSaveHotkey";

export function FileView() {
	const [searchParams] = useSearchParams();
	const path = searchParams.get("path") ?? "";
	const { selectedCwd } = useRepoSelectionContext();
	const state = useFileContent(selectedCwd, path);
	const buffer = useFileBuffer(selectedCwd, path, state);
	const isMarkdown = languageForPath(path) === "markdown";
	const [mode, setMode] = useState<FileViewMode>("raw");
	useSaveHotkey(buffer.save);

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
				onSave={buffer.save}
				saving={buffer.saving}
			/>
			{state.status === "ready" && (
				<FileViewBody
					path={path}
					rendered={isMarkdown && mode === "rendered"}
					value={buffer.value}
					onChange={buffer.setValue}
				/>
			)}
			<ErrorSnackbar error={buffer.error} onClose={buffer.clearError} />
		</PageShell>
	);
}
