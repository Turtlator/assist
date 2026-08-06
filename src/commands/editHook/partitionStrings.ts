import { type EditHookInput } from "./decideOverrideGuard";

function defined(values: (string | undefined)[]): string[] {
	return values.filter((value): value is string => value != null);
}

export function partitionStrings(
	input: EditHookInput,
	existingContent: string | undefined,
): { added: string[]; removed: string[] } {
	const { tool_name, tool_input } = input;
	switch (tool_name) {
		case "Edit":
			return {
				added: defined([tool_input.new_string]),
				removed: defined([tool_input.old_string]),
			};
		case "MultiEdit": {
			const edits = tool_input.edits ?? [];
			return {
				added: defined(edits.map((e) => e.new_string)),
				removed: defined(edits.map((e) => e.old_string)),
			};
		}
		case "Write":
			return {
				added: defined([tool_input.content]),
				removed: defined([existingContent]),
			};
		default:
			return { added: [], removed: [] };
	}
}
