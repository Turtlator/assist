import { normalizeGithubIssue } from "../../../backlog/associate-github/normalizeGithubIssue";

export type FixStructureTarget = {
	owner: string;
	repo: string;
	number: number;
};

const BARE_NUMBER = /^#?(\d+)$/;
const REPO_SLUG = /^([^/\s]+)\/([^/\s]+)$/;

export function resolveFixStructureTarget(
	target: string,
	repo: string | undefined,
): FixStructureTarget {
	const shorthand = normalizeGithubIssue(target);
	if (shorthand) {
		const [slug, number] = shorthand.split("#");
		const [owner, name] = (slug ?? "").split("/");
		return { owner: owner ?? "", repo: name ?? "", number: Number(number) };
	}

	const bare = BARE_NUMBER.exec(target.trim());
	if (!bare) {
		throw new Error(
			`Could not read "${target}" as a GitHub issue. Pass owner/repo#number, a github.com issue URL, or a bare number with --repo owner/repo`,
		);
	}
	if (!repo) {
		throw new Error(
			`A bare issue number needs a repository. Re-run with --repo owner/repo, or pass the issue as owner/repo#${bare[1]}`,
		);
	}
	const slug = REPO_SLUG.exec(repo.trim());
	if (!slug) {
		throw new Error(`--repo must be owner/repo, not "${repo}"`);
	}
	return {
		owner: slug[1] ?? "",
		repo: slug[2] ?? "",
		number: Number(bare[1]),
	};
}
