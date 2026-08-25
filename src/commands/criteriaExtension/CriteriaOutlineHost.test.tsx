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

const BULLETS = BODY.replace("1. one", "- one").replace(
	"   1. nested",
	"  - nested",
);

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

	it("offers a convert button for a bulleted section", () => {
		host(BULLETS);
		expect(
			screen.getByRole("button", { name: "Convert to outline" }),
		).toBeDefined();
		expect(screen.queryByLabelText("Acceptance criteria")).toBe(null);
	});

	it("keeps the bullets in the leading field until convert is pressed", () => {
		host(BULLETS);
		expect(
			screen.getByLabelText<HTMLTextAreaElement>(
				"Body before acceptance criteria",
			).value,
		).toBe("Intro\n\n## Acceptance Criteria\n\n- one\n  - nested");
	});

	it("converts a bulleted section without moving the rest of the body", () => {
		const onBody = host(BULLETS);
		fireEvent.click(screen.getByRole("button", { name: "Convert to outline" }));
		expect(onBody).toHaveBeenCalledWith(BODY);
	});

	it("opens the outline on the converted body", () => {
		host(BULLETS);
		fireEvent.click(screen.getByRole("button", { name: "Convert to outline" }));
		expect(screen.getByLabelText("Criterion 1.1")).toBeDefined();
	});

	it("offers an insert button when the body has no criteria heading", () => {
		host("Intro");
		expect(
			screen.getByRole("button", { name: "Add acceptance criteria" }),
		).toBeDefined();
	});

	it("appends a criteria section when insert is pressed", () => {
		const onBody = host("Intro");
		fireEvent.click(
			screen.getByRole("button", { name: "Add acceptance criteria" }),
		);
		expect(onBody).toHaveBeenCalledWith(
			"Intro\n\n## Acceptance criteria\n\n1.",
		);
	});

	it("opens the outline on the inserted section", () => {
		host("Intro");
		fireEvent.click(
			screen.getByRole("button", { name: "Add acceptance criteria" }),
		);
		expect(screen.getByLabelText("Criterion 1")).toBeDefined();
	});

	it("keeps a headingless body editable beside the insert button", () => {
		const onBody = host("Intro");
		fireEvent.change(screen.getByLabelText("Issue body"), {
			target: { value: "Preamble" },
		});
		expect(onBody).toHaveBeenCalledWith("Preamble");
	});
});
