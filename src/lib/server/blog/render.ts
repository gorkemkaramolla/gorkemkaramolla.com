import { marked, type Token, type Tokens } from 'marked';

const WORDS_PER_MINUTE = 220;
const EMBED_ALLOW =
	'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
const EXPLICIT_YOUTUBE_EMBED_LABEL = 'youtube-embed';
const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

type HeadingTokenWithId = Tokens.Heading & { id?: string };

export type TableOfContentsItem = {
	id: string;
	text: string;
	level: 2 | 3;
};

export type RenderedBlogMarkdown = {
	htmlContent: string;
	readingMinutes: number;
	tableOfContents: TableOfContentsItem[];
};

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function createSlugger() {
	const seen = new Map<string, number>();

	return (text: string) => {
		const base = slugifyHeading(text) || 'section';
		const count = seen.get(base) ?? 0;

		seen.set(base, count + 1);

		return count === 0 ? base : `${base}-${count}`;
	};
}

export function getYouTubeEmbedUrl(url: string): string | null {
	try {
		const parsedUrl = new URL(url);
		let videoId: string | null = null;

		if (parsedUrl.hostname === 'youtu.be') {
			videoId = parsedUrl.pathname.split('/').filter(Boolean)[0] ?? null;
		} else if (parsedUrl.hostname.includes('youtube.com')) {
			videoId =
				parsedUrl.searchParams.get('v') ??
				(parsedUrl.pathname.startsWith('/shorts/')
					? parsedUrl.pathname.split('/').filter(Boolean)[1] ?? null
					: null);
		}

		if (videoId) {
			return `https://www.youtube-nocookie.com/embed/${videoId}`;
		}
	} catch {
		// Ignore malformed URLs and fall back to standard link rendering.
	}

	return null;
}

function renderVideoEmbed(embedUrl: string): string {
	return `<div class="video-embed"><iframe src="${escapeHtml(embedUrl)}" frameborder="0" allowfullscreen allow="${EMBED_ALLOW}"></iframe></div>\n`;
}

function isExplicitYouTubeEmbedLink(token: Tokens.Link): boolean {
	return token.text.trim().toLowerCase() === EXPLICIT_YOUTUBE_EMBED_LABEL;
}

function sanitizeHref(href: string): string | null {
	if (!href) return null;
	if (href.startsWith('#') || href.startsWith('/')) return href;

	if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href)) {
		try {
			const parsedUrl = new URL(href);
			return SAFE_PROTOCOLS.has(parsedUrl.protocol) ? href : null;
		} catch {
			return null;
		}
	}

	return href;
}

function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}

function collectReadableText(tokens: Token[]): string {
	return tokens
		.map((token) => {
			switch (token.type) {
				case 'space':
				case 'hr':
				case 'html':
				case 'def':
				case 'image':
				case 'checkbox':
				case 'code':
					return '';
				case 'table':
					return [
						...token.header.map((cell: Tokens.TableCell) => collectReadableText(cell.tokens)),
						...token.rows.flatMap((row: Tokens.TableCell[]) =>
							row.map((cell: Tokens.TableCell) => collectReadableText(cell.tokens))
						)
					].join(' ');
				case 'list':
					return token.items
						.map((item: Tokens.ListItem) => collectReadableText(item.tokens))
						.join(' ');
				case 'text':
					return token.tokens ? collectReadableText(token.tokens) : token.text;
				default:
					if ('tokens' in token && Array.isArray(token.tokens)) {
						return collectReadableText(token.tokens);
					}
					return 'text' in token ? token.text : '';
			}
		})
		.join(' ');
}

function countWords(text: string): number {
	return text.split(/\s+/).filter(Boolean).length;
}

function annotateTokens(tokens: Token[], slugger: (text: string) => string, toc: TableOfContentsItem[]) {
	for (const token of tokens) {
		switch (token.type) {
			case 'heading': {
				const headingToken = token as HeadingTokenWithId;
				const id = slugger(headingToken.text);

				headingToken.id = id;

				if (headingToken.depth === 2 || headingToken.depth === 3) {
					toc.push({
						id,
						text: headingToken.text,
						level: headingToken.depth
					});
				}

				annotateTokens(headingToken.tokens, slugger, toc);
				break;
			}
			case 'list':
				for (const item of token.items) {
					annotateTokens(item.tokens, slugger, toc);
				}
				break;
			case 'table':
				for (const cell of token.header) {
					annotateTokens(cell.tokens, slugger, toc);
				}
				for (const row of token.rows) {
					for (const cell of row) {
						annotateTokens(cell.tokens, slugger, toc);
					}
				}
				break;
			default:
				if ('tokens' in token && Array.isArray(token.tokens)) {
					annotateTokens(token.tokens, slugger, toc);
				}
				break;
		}
	}
}

function createRenderer() {
	const renderer = new marked.Renderer();
	const originalParagraph = renderer.paragraph.bind(renderer);

	renderer.heading = function (
		this: InstanceType<typeof marked.Renderer>,
		token: Tokens.Heading
	): string {
		const headingToken = token as HeadingTokenWithId;
		const id = headingToken.id ?? slugifyHeading(token.text) ?? 'section';
		const text = String(this.parser.parseInline(token.tokens));

		return `<h${token.depth} id="${escapeHtml(id)}"><a class="blog-heading-link" href="#${escapeHtml(id)}">${text}</a></h${token.depth}>\n`;
	};

	renderer.link = function (this: InstanceType<typeof marked.Renderer>, token: Tokens.Link): string {
		const href = sanitizeHref(token.href);
		const text = isExplicitYouTubeEmbedLink(token)
			? escapeHtml(token.href)
			: String(this.parser.parseInline(token.tokens));

		if (!href) {
			return text;
		}

		const attributes = [`href="${escapeHtml(href)}"`];

		if (token.title) {
			attributes.push(`title="${escapeHtml(token.title)}"`);
		}

		if (isExternalHref(href)) {
			attributes.push('target="_blank"', 'rel="noreferrer noopener"');
		}

		return `<a ${attributes.join(' ')}>${text}</a>`;
	};

	renderer.image = function (token: Tokens.Image): string {
		const href = sanitizeHref(token.href);
		if (!href) {
			return '';
		}

		const caption = token.title ? `<figcaption>${escapeHtml(token.title)}</figcaption>` : '';
		const titleAttribute = token.title ? ` title="${escapeHtml(token.title)}"` : '';

		return `<figure class="blog-figure"><img src="${escapeHtml(href)}" alt="${escapeHtml(token.text || '')}" loading="lazy"${titleAttribute} />${caption}</figure>\n`;
	};

	renderer.paragraph = function (
		this: InstanceType<typeof marked.Renderer>,
		token: Tokens.Paragraph
	): string {
		if (token.tokens.length === 1) {
			const onlyToken = token.tokens[0];

			if (onlyToken.type === 'link') {
				const linkToken = onlyToken as Tokens.Link;
				const embedUrl = isExplicitYouTubeEmbedLink(linkToken)
					? getYouTubeEmbedUrl(linkToken.href)
					: null;
				if (embedUrl) {
					return renderVideoEmbed(embedUrl);
				}
			}
		}

		return originalParagraph(token);
	};

	return renderer;
}

export function renderBlogMarkdown(markdown: string | null | undefined): RenderedBlogMarkdown {
	if (!markdown) {
		return {
			htmlContent: '',
			readingMinutes: 0,
			tableOfContents: []
		};
	}

	const tokens = marked.lexer(markdown);
	const tableOfContents: TableOfContentsItem[] = [];

	annotateTokens(tokens, createSlugger(), tableOfContents);

	const htmlContent = marked.parser(tokens, {
		renderer: createRenderer()
	});
	const wordCount = countWords(collectReadableText(tokens));

	return {
		htmlContent,
		readingMinutes: wordCount > 0 ? Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)) : 0,
		tableOfContents
	};
}
