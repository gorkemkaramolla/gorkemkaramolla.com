import { describe, expect, it } from 'vitest';

import { renderBlogMarkdown } from './render';

describe('renderBlogMarkdown', () => {
	it('extracts reading time, unique heading ids, and a table of contents', () => {
		const markdown = `
# Title

## Deep Dive

This paragraph introduces the topic with enough words to count as readable prose.

### Details

More supporting text lives here.

## Deep Dive

Closing notes.
`;

		const rendered = renderBlogMarkdown(markdown);

		expect(rendered.readingMinutes).toBe(1);
		expect(rendered.tableOfContents).toEqual([
			{ id: 'deep-dive', text: 'Deep Dive', level: 2 },
			{ id: 'details', text: 'Details', level: 3 },
			{ id: 'deep-dive-1', text: 'Deep Dive', level: 2 }
		]);
		expect(rendered.htmlContent).toContain('id="title"');
		expect(rendered.htmlContent).toContain('id="deep-dive"');
		expect(rendered.htmlContent).toContain('id="deep-dive-1"');
	});

	it('embeds only explicit youtube embed markers', () => {
		const markdown = `
[youtube-embed](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
`;

		const rendered = renderBlogMarkdown(markdown);

		expect(rendered.htmlContent).toContain('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
	});

	it('keeps regular youtube links and external links as anchors', () => {
		const markdown = `
https://youtu.be/dQw4w9WgXcQ

[Watch trailer](https://www.youtube.com/watch?v=oHg5SJYRHA0)

Watch this [YouTube reference](https://www.youtube.com/watch?v=dQw4w9WgXcQ) before reading more.

[External resource](https://example.com/docs)
`;

		const rendered = renderBlogMarkdown(markdown);

		expect(rendered.htmlContent).not.toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
		expect(rendered.htmlContent).toContain('href="https://youtu.be/dQw4w9WgXcQ"');
		expect(rendered.htmlContent).toContain('href="https://www.youtube.com/watch?v=oHg5SJYRHA0"');
		expect(rendered.htmlContent).toContain('href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"');
		expect(rendered.htmlContent).toContain('target="_blank"');
		expect(rendered.htmlContent).toContain('rel="noreferrer noopener"');
	});
});
