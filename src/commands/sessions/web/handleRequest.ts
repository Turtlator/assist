import { createBundleHandler } from "../../../shared/createBundleHandler";
import { createFallbackHandler } from "../../../shared/createFallbackHandler";
import { createHtmlHandler, type Handler } from "../../../shared/web";
import { getBacklogSummary } from "../../backlog/web/getBacklogSummary";
import { handleItemRoute } from "../../backlog/web/handleItemRoute";
import { listItems } from "../../backlog/web/shared";
import { diff } from "./diff";
import { fileContent } from "./fileContent";
import { getBackups } from "./getBackups";
import { getConfig } from "./getConfig";
import { getHtml } from "./getHtml";
import { handleServerRuns } from "./handleServerRuns";
import { getReviewSynthesis } from "./getReviewSynthesis";
import { githubUrl } from "./githubUrl";
import { gitStatus } from "./gitStatus";
import { harnessCapabilities } from "./harnessCapabilities";
import { jiraSite } from "./jiraSite";
import { listFiles } from "./listFiles";
import { listNewsItems } from "./listNewsItems";
import { listUsageHistory } from "./listUsageHistory";
import { openInCode } from "./openInCode";
import { prList } from "./prList";
import { prStatus } from "./prStatus";
import { restartWeb } from "./restartWeb";
import { setConfig } from "./setConfig";
import { uploadPrImage } from "./uploadPrImage";
import { createCssHandler } from "./createCssHandler";

const htmlHandler = createHtmlHandler(getHtml);

const routes: Record<string, Handler> = {
	"GET /": htmlHandler,
	"GET /bundle.js": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/bundle.js",
	),
	"GET /xterm.css": createCssHandler("@xterm/xterm/css/xterm.css"),
	"GET /bundle.css": createBundleHandler(
		import.meta.url,
		"commands/sessions/web/bundle.css",
		"text/css",
	),
	"GET /api/items": listItems,
	"GET /api/backlog/summary": getBacklogSummary,
	"POST /api/open-in-code": openInCode,
	"POST /api/pr-preview/upload-image": uploadPrImage,
	"POST /api/restart": restartWeb,
	"GET /api/github-url": githubUrl,
	"GET /api/git-status": gitStatus,
	"GET /api/diff": diff,
	"GET /api/file": fileContent,
	"GET /api/files": listFiles,
	"GET /api/jira-site": jiraSite,
	"GET /api/harness": harnessCapabilities,
	"GET /api/pr-status": prStatus,
	"GET /api/server-runs": handleServerRuns,
	"GET /api/pr-list": prList,
	"GET /api/news/items": listNewsItems,
	"GET /api/usage/history": listUsageHistory,
	"GET /api/backups/list": getBackups,
	"GET /api/config": getConfig,
	"POST /api/config/set": setConfig,
	"GET /api/review/synthesis": getReviewSynthesis,
};

export const handleRequest = createFallbackHandler(
	routes,
	htmlHandler,
	handleItemRoute,
);
