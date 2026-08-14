import { validateProposedContent } from "../../shared/validateProposedContent";
import { findWallOfText } from "./findWallOfText";

export function validatePrContent(title: string, body: string): void {
	validateProposedContent({ subject: "PR", context: "PRs" }, title, body);

	const wall = findWallOfText(body);
	if (wall) {
		console.error(
			`Error: the "${wall.section}" section contains a wall-of-text paragraph (${wall.chars} chars). Be concise — split it into bullet points or trim it.`,
		);
		process.exit(1);
	}
}
