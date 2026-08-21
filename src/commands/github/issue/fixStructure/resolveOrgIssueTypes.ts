import { runGhGraphqlJson } from "../../../../shared/runGhGraphqlJson";
import type { IssueType } from "./types";

const QUERY = `query($owner: String!) {
	organization(login: $owner) {
		issueTypes(first: 50) { nodes { id name } }
	}
}`;

function missingOrg(owner: string): Error {
	return new Error(
		`Issue types live on the organisation, and ${owner} is not one this token can read`,
	);
}

export function resolveOrgIssueTypes(owner: string): IssueType[] {
	let raw: string;
	try {
		raw = runGhGraphqlJson(QUERY, { owner });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (message.includes("Could not resolve to an Organization")) {
			throw missingOrg(owner);
		}
		throw error;
	}
	const organization = (
		JSON.parse(raw) as {
			data?: {
				organization?: {
					issueTypes?: { nodes?: (IssueType | null)[] };
				} | null;
			};
		}
	).data?.organization;
	if (!organization) throw missingOrg(owner);
	const types = (organization.issueTypes?.nodes ?? []).filter(
		(type) => type !== null,
	);
	if (types.length === 0) {
		throw new Error(`The ${owner} organisation has no issue types defined`);
	}
	return types;
}
