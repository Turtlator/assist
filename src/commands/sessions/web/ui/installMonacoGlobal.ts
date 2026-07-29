import "monaco-editor/features/register.all";
import "monaco-editor/languages/definitions/register.all";
import * as monaco from "monaco-editor/editor";

export function installMonacoGlobal(): void {
	(globalThis as unknown as { monaco: typeof monaco }).monaco = monaco;
}

installMonacoGlobal();
