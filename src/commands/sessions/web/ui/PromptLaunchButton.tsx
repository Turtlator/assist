import { useState } from "react";
import type { HarnessKind } from "../../../../shared/harnesses";
import { DropdownWrapper } from "./DropdownWrapper";
import { FreePromptForm } from "./FreePromptForm";
import { harnessChoices } from "./harnessChoices";
import { HarnessRadio } from "./HarnessRadio";
import { useHarnessCapabilities } from "./useHarnessCapabilities";

export function PromptLaunchButton({
	cwd,
	disabled,
	onCreate,
	onCreateHarness,
}: {
	cwd: string;
	disabled: boolean;
	onCreate: (prompt: string, cwd: string) => void;
	onCreateHarness: (harness: string, prompt: string, cwd: string) => void;
}) {
	const choices = harnessChoices(useHarnessCapabilities());
	const [prompt, setPrompt] = useState("");
	const [harness, setHarness] = useState<HarnessKind>("claude");

	return (
		<DropdownWrapper label="prompt" disabled={disabled}>
			{(close) => (
				<FreePromptForm
					value={prompt}
					onChange={setPrompt}
					header={
						choices.length > 1 ? (
							<HarnessRadio
								choices={choices}
								value={harness}
								onChange={setHarness}
							/>
						) : undefined
					}
					onSubmit={() => {
						if (harness === "claude") onCreate(prompt, cwd);
						else onCreateHarness(harness, prompt, cwd);
						setPrompt("");
						setHarness("claude");
						close();
					}}
				/>
			)}
		</DropdownWrapper>
	);
}
