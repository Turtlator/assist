import { skipCsharpCharLiteral } from "./skipCsharpCharLiteral";
import { skipCsharpString } from "./skipCsharpString";

export function stepRazorCode(
	content: string,
	index: number,
): { next: number; depthChange: number } {
	const char = content[index];
	if (char === "{") return { next: index + 1, depthChange: 1 };
	if (char === "}") return { next: index + 1, depthChange: -1 };
	if (char === "'")
		return { next: skipCsharpCharLiteral(content, index), depthChange: 0 };

	const afterString = skipCsharpString(content, index);
	return { next: afterString ?? index + 1, depthChange: 0 };
}
