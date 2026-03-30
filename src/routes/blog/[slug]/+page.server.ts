import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { marked, type Tokens } from 'marked';

function getYouTubeEmbedUrl(url: string): string | null {
	try {
		const u = new URL(url);
		let videoId: string | null = null;
		if (u.hostname === 'youtu.be') {
			videoId = u.pathname.slice(1);
		} else if (u.hostname.includes('youtube.com')) {
			videoId = u.searchParams.get('v');
		}
		if (videoId) return `https://www.youtube.com/embed/${videoId}`;
	} catch {
		// not a valid URL
	}
	return null;
}

const renderer = new marked.Renderer();

const originalParagraph = renderer.paragraph.bind(renderer);

renderer.link = function (token: Tokens.Link) {
	const embedUrl = getYouTubeEmbedUrl(token.href);
	if (embedUrl) {
		return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>\n`;
	}
	return `<a href="${token.href}">${token.text}</a>`;
};

renderer.paragraph = function (
	this: InstanceType<typeof marked.Renderer>,
	token: Tokens.Paragraph
) {
	const { tokens } = token;
	if (tokens.length === 1 && tokens[0].type === 'text') {
		const text = (tokens[0] as Tokens.Text).text.trim();
		const embedUrl = getYouTubeEmbedUrl(text);
		if (embedUrl) {
			return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>\n`;
		}
	}
	return originalParagraph(token);
};

export const load = async ({ params }: { params: { slug: string } }) => {
	const post = await db.query.blogPost.findFirst({
		where: eq(blogPost.slug, params.slug)
	});

	if (!post) throw error(404, 'Post not found');

	const htmlContent = post.mdContent ? await marked(post.mdContent, { renderer }) : '';

	return { post, htmlContent };
};
