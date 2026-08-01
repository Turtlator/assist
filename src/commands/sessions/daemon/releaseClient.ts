import type { SessionClient } from "./broadcast";
import type { ClientHub } from "./ClientHub";
import type { PrPreviewCoordinator } from "./PrPreviewCoordinator";
import type { VerifyTracker } from "./VerifyTracker";

export function releaseClient(
	client: SessionClient,
	clients: ClientHub,
	prPreview: PrPreviewCoordinator,
	verify: VerifyTracker,
): void {
	clients.delete(client);
	clients.unsubscribeLogs(client);
	prPreview.clearWaiter(client);
	verify.clear(client);
}
