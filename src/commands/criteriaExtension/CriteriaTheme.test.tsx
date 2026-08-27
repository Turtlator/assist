// @vitest-environment jsdom
import { useTheme } from "@mui/material";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CriteriaTheme } from "./CriteriaTheme";

function ShowMode() {
	return <span>{useTheme().palette.mode}</span>;
}

afterEach(() => {
	cleanup();
	for (const name of ["data-color-mode", "data-light-theme", "data-dark-theme"])
		document.documentElement.removeAttribute(name);
});

function open() {
	render(
		<CriteriaTheme>
			<ShowMode />
		</CriteriaTheme>,
	);
}

async function setColorMode(mode: string) {
	await act(async () => {
		document.documentElement.setAttribute("data-color-mode", mode);
	});
}

describe("CriteriaTheme", () => {
	it("starts in GitHub's current colour mode", () => {
		document.documentElement.setAttribute("data-color-mode", "dark");
		open();
		expect(screen.getByText("dark")).toBeDefined();
	});

	it("follows a colour mode switch while the outline is open", async () => {
		document.documentElement.setAttribute("data-color-mode", "light");
		open();

		await setColorMode("dark");

		expect(screen.getByText("dark")).toBeDefined();
	});
});
