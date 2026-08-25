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

function host(body = BODY) {
	const onBody = vi.fn();
	render(<CriteriaOutlineHost initialBody={body} onBody={onBody} />);
	return onBody;
}

describe("CriteriaOutlineHost", () => {
	it("writes an edited criterion back as a nested ordered list", () => {
		const onBody = host();
		fireEvent.change(screen.getByLabelText("Criterion 1"), {
			target: { value: "first" },
		});
		expect(onBody).toHaveBeenCalledWith(BODY.replace("1. one", "1. first"));
	});

	it("numbers rows by source depth", () => {
		host();
		expect(screen.getByLabelText("Criterion 1.1")).toBeDefined();
	});

	it("writes edited prose before the section back", () => {
		const onBody = host();
		fireEvent.change(screen.getByLabelText("Body before acceptance criteria"), {
			target: { value: "Preamble\n\n## Acceptance Criteria\n" },
		});
		expect(onBody).toHaveBeenCalledWith(BODY.replace("Intro", "Preamble"));
	});

	it("writes edited prose after the section back", () => {
		const onBody = host();
		fireEvent.change(screen.getByLabelText("Body after acceptance criteria"), {
			target: { value: "\n## Notes\nchanged" },
		});
		expect(onBody).toHaveBeenCalledWith(BODY.replace("keep", "changed"));
	});

	it("leaves criterion markers untouched when only prose changes", () => {
		const onBody = host(BODY.replace("1. one", "2. one"));
		fireEvent.change(screen.getByLabelText("Body before acceptance criteria"), {
			target: { value: "Preamble\n\n## Acceptance Criteria\n" },
		});
		expect(onBody.mock.calls[0][0]).toContain("2. one");
	});

	it("renders nothing when the body has no criteria section", () => {
		const { container } = render(
			<CriteriaOutlineHost initialBody="Intro" onBody={vi.fn()} />,
		);
		expect(container.querySelector("[data-criterion-row]")).toBe(null);
	});
});
