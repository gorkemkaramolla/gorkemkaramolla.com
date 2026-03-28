import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';

export const load = async ({ params }) => {
	const post = await db.query.blogPost.findFirst({
		where: eq(blogPost.slug, params.slug)
	});

	if (!post) throw error(404, 'Post not found');

	const htmlContent = post.mdContent ? await marked(post.mdContent) : '';

	return { post, htmlContent };
};
