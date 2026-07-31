import { carriedUnanchoredFindings } from "./carriedUnanchoredFindings";
import { type ParsedFinding, parseFindings } from "./parseFindings";
import type { UnanchorReason, UnanchoredFinding } from "./partitionFindings";
import {
	formatSynthesisSummary,
	summariseSynthesis,
} from "./summariseSynthesis";

const UNANCHOR_REASONS: Record<UnanchorReason, string> = {
	"out-of-diff": "its line falls outside the PR diff",
	unlocated: "it has no parseable file:line",
};

function formatFindingLine(finding: ParsedFinding): string {
	const severity = finding.severity ?? "finding";
	return `- **${severity}: ${finding.title}**`;
}

function formatLocation(finding: UnanchoredFinding): string {
	const location = finding.location.trim();
	if (!location || location.toLowerCase() === "n/a") return "no location";
	return `\`${location}\``;
}

function formatUnanchoredFinding(finding: UnanchoredFinding): string[] {
	const lines = [
		`${formatFindingLine(finding)} — ${formatLocation(finding)}`,
		`  - Not anchored: ${UNANCHOR_REASONS[finding.reason]}`,
	];
	if (finding.impact) lines.push(`  - Impact: ${finding.impact}`);
	if (finding.recommendation)
		lines.push(`  - Recommendation: ${finding.recommendation}`);
	return lines;
}

export function buildReviewSummary(
	markdown: string,
	unanchored: UnanchoredFinding[] = [],
): string {
	const summary = summariseSynthesis(markdown);
	const findings = parseFindings(markdown);
	const lines = ["## Code review summary", "", formatSynthesisSummary(summary)];
	if (findings.length > 0) {
		lines.push("", "### Findings", "");
		for (const finding of findings) lines.push(formatFindingLine(finding));
	}
	const carried = carriedUnanchoredFindings(unanchored);
	if (carried.length > 0) {
		lines.push(
			"",
			"### Findings not anchored to the diff",
			"",
			"No line comment could be attached to these, so the detail is here instead.",
			"",
		);
		for (const finding of carried)
			lines.push(...formatUnanchoredFinding(finding));
	}
	return lines.join("\n");
}
