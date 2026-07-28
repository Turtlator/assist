import type { ConfigHelpEntry } from "../../shared/configHelp";

export const roamConfigHelp: ConfigHelpEntry[] = [
	{
		key: "roam.clientId",
		setter: "assist roam auth",
		note: "OAuth client ID (written by the auth flow)",
	},
	{
		key: "roam.clientSecret",
		setter: "assist roam auth",
		note: "OAuth client secret (written by the auth flow)",
	},
	{
		key: "roam.accessToken",
		setter: "assist roam auth",
		note: "OAuth access token (managed by the auth flow)",
	},
	{
		key: "roam.refreshToken",
		setter: "assist roam auth",
		note: "OAuth refresh token (managed by the auth flow)",
	},
	{
		key: "roam.tokenExpiresAt",
		setter: "assist roam auth",
		note: "access-token expiry epoch (managed by the auth flow)",
	},
];
