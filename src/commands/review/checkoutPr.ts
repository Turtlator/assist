import { execFileSync } from "node:child_process";
import chalk from "chalk";
import { moveToPrCheckoutTree } from "./moveToPrCheckoutTree";

export async function checkoutPr(number: string): Promise<void> {
	await moveToPrCheckoutTree();
	try {
		execFileSync("gh", ["pr", "checkout", number], { stdio: "inherit" });
	} catch {
		console.error(chalk.red(`gh pr checkout ${number} failed; aborting.`));
		process.exit(1);
	}
}
