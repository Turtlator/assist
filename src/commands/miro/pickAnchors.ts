import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";
import { encodeMiroBoardPreview } from "./encodeMiroBoardPreview";
import { MiroExtractError } from "./MiroExtractError";
import type { MiroItem } from "./types";

const skipAdvice =
	"Re-run with --top-left <id|link> --bottom-right <id|link> to skip the picker.";

export async function pickAnchors(
	sessionId: string,
	items: MiroItem[],
): Promise<[string, string]> {
	const decision = await awaitPreviewApproval(
		"Miro anchor selection",
		{
			sessionId,
			requestId: randomUUID(),
			title: "Pick the top-left then the bottom-right box",
			body: encodeMiroBoardPreview(items),
			prNumber: null,
			kind: "miro-board",
		},
		{ rejectionAdvice: `Nothing was extracted. ${skipAdvice}` },
	);

	const selection = decision.selection;
	if (!selection)
		throw new MiroExtractError(`The picker returned no boxes. ${skipAdvice}`);

	console.log(
		`Anchors: --top-left ${selection.topLeft} --bottom-right ${selection.bottomRight}`,
	);
	return [selection.topLeft, selection.bottomRight];
}
