import { db } from '$lib/server/db';

type PublishedBlogPost = {
	slug: string;
	title: string;
	summary: string | null;
	tags: string[];
	publishedAt: string | null;
	isFeatured: boolean;
	featuredImageUrl: string | null;
};

type GetPublishedBlogPostsOptions = {
	limit?: number;
};

export async function getPublishedBlogPosts(
	options: GetPublishedBlogPostsOptions = {}
): Promise<PublishedBlogPost[]> {
	const posts = await db.query.blogPost.findMany({
		where: (post, { eq }) => eq(post.status, 'published'),
		orderBy: (post, { desc }) => [desc(post.isFeatured), desc(post.publishedAt)]
	});

	const curatedPosts = posts
		.filter((post) => post.slug && post.title)
		.map((post) => ({
			slug: post.slug,
			title: post.title ?? 'Untitled note',
			summary: post.summary ?? post.metaDescription,
			publishedAt: post.publishedAt,
			tags: post.tags ?? [],
			isFeatured: post.isFeatured,
			featuredImageUrl: post.featuredImageUrl
		}));

	return typeof options.limit === 'number' ? curatedPosts.slice(0, options.limit) : curatedPosts;
}
