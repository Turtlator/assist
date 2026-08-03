import type { HarnessKind } from "./harnesses";

const HARNESS_LABELS: Record<HarnessKind, string> = {
	claude: "Claude",
	codex: "Codex",
	pi: "pi",
};

const HARNESS_PRODUCT_LABELS: Record<HarnessKind, string> = {
	claude: "Claude Code",
	codex: "Codex",
	pi: "pi",
};

export function resolveHarness(harness: HarnessKind | undefined): HarnessKind {
	return harness ?? "claude";
}

export function harnessLabel(harness: HarnessKind | undefined): string {
	return HARNESS_LABELS[resolveHarness(harness)];
}

export function harnessProductLabel(harness: HarnessKind | undefined): string {
	return HARNESS_PRODUCT_LABELS[resolveHarness(harness)];
}
