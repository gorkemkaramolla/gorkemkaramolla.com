import { db } from '$lib/server/db';

export const load = async () => {
	const posts = await db.query.blogPost.findMany();
	return { posts };
};
