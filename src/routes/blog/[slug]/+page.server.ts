import { renderBlogMarkdown } from '$lib/server/blog/render';
import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params }) => {
	const post = await db.query.blogPost.findFirst({
		where: eq(blogPost.slug, params.slug)
	});

	if (!post) throw error(404, 'Post not found');

	const { htmlContent, readingMinutes, tableOfContents } = renderBlogMarkdown(post.mdContent);

	return { post, htmlContent, readingMinutes, tableOfContents };
};
