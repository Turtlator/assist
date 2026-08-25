// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CriteriaOutlineHost } from "./CriteriaOutlineHost";

afterEach(cleanup);

const BODY = [
	"Intro",
	"",
	"## Acceptance Criteria",
	"",
	"1. one",
	"   1. nested",
	"",
	"## Notes",
	"keep",
].join("\n");

describe("CriteriaOutlineHost", () => {
	it("writes an edited criterion back as a nested ordered list", () => {
		const onBody = vi.fn();
		render(<CriteriaOutlineHost initialBody={BODY} onBody={onBody} />);
		fireEvent.change(screen.getByLabelText("Criterion 1"), {
			target: { value: "first" },
		});
		expect(onBody).toHaveBeenCalledWith(
			[
				"Intro",
				"",
				"## Acceptance Criteria",
				"",
				"1. first",
				"   1. nested",
				"",
				"## Notes",
				"keep",
			].join("\n"),
		);
	});

	it("numbers rows by source depth", () => {
		render(<CriteriaOutlineHost initialBody={BODY} onBody={vi.fn()} />);
		expect(screen.getByLabelText("Criterion 1.1")).toBeDefined();
	});

	it("renders nothing when the body has no criteria section", () => {
		const { container } = render(
			<CriteriaOutlineHost initialBody="Intro" onBody={vi.fn()} />,
		);
		expect(container.querySelector("[data-criterion-row]")).toBe(null);
	});
});
