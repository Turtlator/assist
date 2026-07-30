import { MarkdownBlock } from "../../../backlog/web/ui/components/MarkdownBlock";
import { MonacoEditor } from "./MonacoEditor";
import { monacoLanguageForPath } from "./monacoLanguageForPath";

const EDITOR_HEIGHT = "calc(100vh - 152px)";

export function FileViewBody({
	path,
	rendered,
	value,
	onChange,
}: {
	path: string;
	rendered: boolean;
	value: string;
	onChange: (value: string) => void;
}) {
	if (rendered) return <MarkdownBlock content={value} renderMermaid wide />;

	return (
		<MonacoEditor
			value={value}
			language={monacoLanguageForPath(path)}
			height={EDITOR_HEIGHT}
			onChange={onChange}
		/>
	);
}
