// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RestartButton } from "./RestartButton";

afterEach(cleanup);

describe("RestartButton", () => {
	it("names the session id in its tooltip so cards map to daemon.log ids", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		expect(screen.getByRole("button").title).toBe("Restart session 54");
	});

	it("names the session id in the confirm dialog title", () => {
		render(<RestartButton id="54" onRestart={() => {}} />);

		fireEvent.click(screen.getByRole("button"));

		expect(screen.getByRole("heading").textContent).toBe("Restart session 54");
	});
});
