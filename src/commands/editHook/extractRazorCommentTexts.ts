import { extractRazorComments } from "../../shared/extractRazorComments";
import { commentTexts } from "./commentTexts";

export function extractRazorCommentTexts(text: string): string[] {
	return commentTexts(extractRazorComments(text));
}
