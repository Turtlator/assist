import { readJsonPayload } from "../readJsonPayload";
import { type ProposedItem, proposedItemSchema } from "./proposedItemSchema";

export function readProposedItem(source: string): Promise<ProposedItem> {
	return readJsonPayload(source, proposedItemSchema, "backlog item");
}
