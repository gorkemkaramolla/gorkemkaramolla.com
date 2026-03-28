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

renderer.link = function (token: Tokens.Link) {
	if (token.text === 'youtube-embed') {
		const embedUrl = getYouTubeEmbedUrl(token.href);
		if (embedUrl) {
			return `<div class="video-embed"><iframe src="${embedUrl}" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>\n`;
		}
	}
	return `<a href="${token.href}" target="_blank" rel="noopener noreferrer">${token.text}</a>`;
};

export const load = async ({ params }) => {
	const post = await db.query.blogPost.findFirst({
		where: eq(blogPost.slug, params.slug)
	});

	if (!post) throw error(404, 'Post not found');

	const htmlContent = post.mdContent ? await marked(post.mdContent, { renderer }) : '';

	return { post, htmlContent };
};
