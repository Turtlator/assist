import { cp } from "node:fs/promises";
import chalk from "chalk";
import { detectPlatform } from "../../lib/detectPlatform";

const WSL_WINDOWS_XPI = "/mnt/c/tools/criteria-extension.xpi";
const WSL_WINDOWS_PATH = String.raw`C:\tools\criteria-extension.xpi`;

export async function signedAddonInstallPath(xpi: string): Promise<string> {
	if (detectPlatform() !== "wsl") return xpi;
	try {
		await cp(xpi, WSL_WINDOWS_XPI);
		return WSL_WINDOWS_PATH;
	} catch {
		console.log(
			chalk.yellow(`could not copy the add-on to ${WSL_WINDOWS_PATH}`),
		);
		return xpi;
	}
}
