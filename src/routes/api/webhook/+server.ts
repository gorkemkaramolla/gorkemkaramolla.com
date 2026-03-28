import { json } from '@sveltejs/kit';
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import type { RequestHandler } from './$types';

import { db } from '$lib/server/db';
import { blogPost } from '$lib/server/db/schema';
import type { NewBlogPost } from '$lib/server/db/schema';

const notion = new Client({
	auth: process.env.NOTION_API_KEY as string
});

const n2m = new NotionToMarkdown({ notionClient: notion });

type Properties = PageObjectResponse['properties'];

function getTitle(props: Properties, name: string): string | null {
	const prop = props[name];
	if (prop?.type === 'title') {
		return prop.title.map((t) => t.plain_text).join('') || null;
	}
	return null;
}

function getRichText(props: Properties, name: string): string | null {
	const prop = props[name];
	if (prop?.type === 'rich_text') {
		return prop.rich_text.map((t) => t.plain_text).join('') || null;
	}
	return null;
}

function getUrl(props: Properties, name: string): string | null {
	const prop = props[name];
	if (prop?.type === 'url') {
		return prop.url ?? null;
	}
	return null;
}

function getCheckbox(props: Properties, name: string): boolean {
	const prop = props[name];
	if (prop?.type === 'checkbox') {
		return prop.checkbox;
	}
	return false;
}

function getDate(props: Properties, name: string): string | null {
	const prop = props[name];
	if (prop?.type === 'date') {
		return prop.date?.start ?? null;
	}
	return null;
}

function getPeopleName(props: Properties, name: string): string | null {
	const prop = props[name];
	if (prop?.type !== 'people') return null;

	const first = prop.people[0];
	if (!first) return null;

	if ('name' in first && typeof first.name === 'string') {
		return first.name;
	}

	return null;
}

function getStatus(props: Properties, name: string): 'draft' | 'review' | 'published' | null {
	const prop = props[name];
	if (prop?.type !== 'status') return null;

	const value = prop.status?.name?.toLowerCase();

	if (value === 'draft') return 'draft';
	if (value === 'review' || value === 'in review') return 'review';
	if (value === 'published') return 'published';

	return null;
}

function getTags(props: Properties, name: string): string[] {
	const prop = props[name];
	if (prop?.type === 'url' && prop.url) {
		return prop.url
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean);
	}
	return [];
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		if (payload.verification_token) {
			return json({ success: true });
		}

		const pageId = payload.entity?.id || payload.data?.id;

		if (!pageId) {
			return json({
				success: true,
				message: 'No page ID found'
			});
		}

		const [response, mdblocks] = await Promise.all([
			notion.pages.retrieve({ page_id: pageId }),
			n2m.pageToMarkdown(pageId)
		]);

		const mdString = n2m.toMarkdownString(mdblocks);
		const markdownContent = mdString.parent;

		const page = response as PageObjectResponse;
		const properties = page.properties;

		const articleData: NewBlogPost = {
			title: getTitle(properties, 'title'),
			status: getStatus(properties, 'status'),
			slug: getRichText(properties, 'slug')!,
			metaTitle: getRichText(properties, 'meta_title'),
			metaDescription: getUrl(properties, 'meta_description'),
			publishedAt: getDate(properties, 'published_at'),
			updatedAt: getDate(properties, 'updated_at'),
			tags: getTags(properties, 'tags'),
			noIndex: getCheckbox(properties, 'no_index'),
			ogTitle: getRichText(properties, 'og_title'),
			ogDescription: getRichText(properties, 'og_description'),
			canonicalUrl: getUrl(properties, 'canonical_url'),
			isFeatured: getCheckbox(properties, 'is_featured'),
			author: getPeopleName(properties, 'author'),
			featuredImageUrl: getUrl(properties, 'featured_image_url'),
			featuredImageAlt: getRichText(properties, 'featured_image_alt'),
			ogImage: getUrl(properties, 'og_image'),
			summary: getRichText(properties, 'summary'),
			mdContent: markdownContent
		};

		const [savedPost] = await db
			.insert(blogPost)
			.values(articleData)
			.onConflictDoUpdate({
				target: blogPost.slug,
				set: articleData
			})
			.returning();

		return json({
			success: true,
			data: savedPost
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error('Webhook processing error:', message);

		return json(
			{
				success: false,
				error: message
			},
			{ status: 500 }
		);
	}
};
