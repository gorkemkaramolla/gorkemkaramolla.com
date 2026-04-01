import { getPublishedBlogPosts } from '$lib/server/blog/posts';

export const load = async () => {
	return {
		posts: await getPublishedBlogPosts()
	};
};
