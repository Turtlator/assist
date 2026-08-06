import { extractCsharpComments } from "../../shared/extractCsharpComments";
import { commentTexts } from "./commentTexts";

export function extractCsharpCommentTexts(text: string): string[] {
	return commentTexts(extractCsharpComments(text));
}
