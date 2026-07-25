import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";
import { appendScreenshots } from "./appendScreenshots";
import type { CreateOptions } from "./buildCreateArgs";
import { placePr } from "./placePr";

export async function previewAndPlace(args: {
	sessionId: string;
	title: string;
	body: string;
	prNumber: number | null;
	options: CreateOptions;
}): Promise<void> {
	const decision = await awaitPreviewApproval("PR preview", {
		sessionId: args.sessionId,
		requestId: randomUUID(),
		title: args.title,
		body: args.body,
		prNumber: args.prNumber,
	});

	const body = appendScreenshots(args.body, decision.screenshots ?? []);

	await placePr(args.prNumber, args.title, body, args.options);
}
