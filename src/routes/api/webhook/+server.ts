import { json } from '@sveltejs/kit';
import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import type { RequestHandler, RequestEvent } from './$types';

const notion = new Client({ auth: process.env.NOTION_API_KEY as string });

const n2m = new NotionToMarkdown({ notionClient: notion });

type Properties = PageObjectResponse['properties'];

function getTitle(props: Properties, name: string): string {
	const prop = props[name];
	if (prop?.type === 'title') {
		return prop.title.map((t) => t.plain_text).join('');
	}
	return '';
}

function getRichText(props: Properties, name: string): string {
	const prop = props[name];
	if (prop?.type === 'rich_text') {
		return prop.rich_text.map((t) => t.plain_text).join('');
	}
	return '';
}

export const POST: RequestHandler = async ({ request }: RequestEvent) => {
	try {
		const payload = await request.json();

		if (payload.verification_token) {
			return json({ success: true });
		}

		const pageId = payload.entity?.id || payload.data?.id;
		if (!pageId) {
			return json({ success: true, message: 'No page ID found' });
		}

		const [response, mdblocks] = await Promise.all([
			notion.pages.retrieve({ page_id: pageId }),
			n2m.pageToMarkdown(pageId)
		]);

		const mdString = n2m.toMarkdownString(mdblocks);
		const markdownContent = mdString.parent;

		const page = response as PageObjectResponse;
		const properties = page.properties;

		const urlProp = (name: string): string | null => {
			const prop = properties[name];
			return prop?.type === 'url' ? prop.url : null;
		};

		const checkboxProp = (name: string): boolean => {
			const prop = properties[name];
			return prop?.type === 'checkbox' ? prop.checkbox : false;
		};

		const dateProp = (name: string): string | null => {
			const prop = properties[name];
			return prop?.type === 'date' ? (prop.date?.start ?? null) : null;
		};

		const statusProp = (name: string): string | null => {
			const prop = properties[name];
			return prop?.type === 'status' ? (prop.status?.name ?? null) : null;
		};

		const multiSelectNames = (name: string): string[] => {
			const prop = properties[name];
			return prop?.type === 'multi_select' ? prop.multi_select.map((tag) => tag.name) : [];
		};

		const notionData = {
			id: pageId as string,
			title: getTitle(properties, 'Name') || getTitle(properties, 'Title') || 'Untitled',
			slug: getRichText(properties, 'Slug'),
			summary: getRichText(properties, 'Summary'),
			metaTitle: getRichText(properties, 'Meta Title'),
			metaDescription: getRichText(properties, 'Meta Description'),
			canonicalUrl: urlProp('Canonical URL'),
			featuredImage: urlProp('Featured Image'),
			noIndex: checkboxProp('No index'),
			publishedDate: dateProp('Published date'),
			updatedDate:
				dateProp('Updated date') ??
				(properties['Updated date']?.type === 'last_edited_time'
					? properties['Updated date'].last_edited_time
					: null),
			status: statusProp('Status'),
			tags: multiSelectNames('Tags'),
			content: markdownContent
		};

		console.log(`\n✅ Successfully converted article: ${notionData.title}`);
		console.log(`📝 Content length: ${markdownContent.length} characters`);
		console.log('📦 Notion data:', JSON.stringify(notionData, null, 2));

		// await db.articles.upsert(notionData);

		return json({
			success: true,
			data: notionData
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		console.error('Webhook processing error:', message);
		return json({ error: 'Failed to process webhook' }, { status: 500 });
	}
};
