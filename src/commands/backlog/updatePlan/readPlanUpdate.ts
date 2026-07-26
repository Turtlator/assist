import { readJsonPayload } from "../readJsonPayload";
import { type PlanUpdate, planUpdateSchema } from "./planUpdateSchema";

export function readPlanUpdate(source: string): Promise<PlanUpdate> {
	return readJsonPayload(source, planUpdateSchema, "plan");
}
