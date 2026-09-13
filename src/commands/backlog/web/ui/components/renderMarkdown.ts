import { Marked, Renderer, type Tokens, type TokensList } from "marked";

const externalHref = /^(?:[a-z][a-z0-9+.-]*:)?[/]{2}/i;

const markdown = new Marked({
	renderer: {
		link(token: Tokens.Link) {
			const html = Renderer.prototype.link.call(this, token);
			if (!externalHref.test(token.href)) return html;
			return html.replace(
				/^<a /,
				'<a target="_blank" rel="noopener noreferrer" ',
			);
		},
	},
});

export function renderMarkdown(content: string): string {
	return markdown.parse(content) as string;
}

export function renderMarkdownInline(content: string): string {
	return markdown.parseInline(content) as string;
}

export function lexMarkdown(content: string): TokensList {
	return markdown.lexer(content);
}

export function renderMarkdownTokens(tokens: TokensList): string {
	return markdown.parser(tokens);
}
