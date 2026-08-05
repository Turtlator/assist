import type { ReviewComment } from "../types";
import type { Style } from "./commentStyle";

export function renderReview(comment: ReviewComment, style: Style): string {
	return [
		`${style.cyan("Review")} by ${style.bold(comment.user)} ${style.state(comment.state)}`,
		comment.body,
		"",
	].join("\n");
}
