import { describe, expect, it } from "vitest";
import { stampManifestVersion } from "./stampManifestVersion";

const manifest = JSON.stringify(
	{
		manifest_version: 3,
		name: "assist criteria outliner",
		version: "1.0.0",
		browser_specific_settings: { gecko: { id: "criteria@example.com" } },
	},
	null,
	"\t",
);

describe("stampManifestVersion", () => {
	it("replaces the version", () => {
		const stamped = JSON.parse(stampManifestVersion(manifest, "0.592.1")) as {
			version: string;
		};
		expect(stamped.version).toBe("0.592.1");
	});

	it("keeps every other key", () => {
		const stamped = JSON.parse(stampManifestVersion(manifest, "0.592.1")) as {
			name: string;
			browser_specific_settings: { gecko: { id: string } };
		};
		expect(stamped.name).toBe("assist criteria outliner");
		expect(stamped.browser_specific_settings.gecko.id).toBe(
			"criteria@example.com",
		);
	});

	it("writes tab-indented json with a trailing newline", () => {
		const stamped = stampManifestVersion(manifest, "0.592.1");
		expect(stamped).toContain('\n\t"version": "0.592.1"');
		expect(stamped.endsWith("}\n")).toBe(true);
	});
});
