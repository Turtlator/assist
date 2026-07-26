import { SESSION_TITLE_MAX_LENGTH } from "./generateSessionTitle";

export function singleLineTitle(prompt: string): string {
	return prompt.replace(/\s+/g, " ").trim().slice(0, SESSION_TITLE_MAX_LENGTH);
}
