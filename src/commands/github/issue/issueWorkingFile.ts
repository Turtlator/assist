import { join } from "node:path";
import { getStoreDir } from "../../../shared/loadJson";

type IssueWorkingFile = {
	dir: string;
	bodyPath: string;
	metaPath: string;
};

export function issueWorkingFile(
	slug: string,
	number: number,
): IssueWorkingFile {
	const [owner = "unknown", repo = "unknown"] = slug.split("/");
	const dir = join(getStoreDir(), "github-issues", owner, repo);
	return {
		dir,
		bodyPath: join(dir, `${number}.md`),
		metaPath: join(dir, `${number}.json`),
	};
}
