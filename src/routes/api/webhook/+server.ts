import { json } from '@sveltejs/kit';
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md'; // 👈 1. Import the converter
import type { RequestHandler, RequestEvent } from './$types';

const notion = new Client({ auth: process.env.NOTION_API_KEY as string });

// 👈 2. Initialize the converter
const n2m = new NotionToMarkdown({ notionClient: notion });

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

		// 👈 3. Fetch properties and Convert to Markdown simultaneously
		// We replace fetchAllBlocks with n2m.pageToMarkdown
		const [response, mdblocks] = await Promise.all([
			notion.pages.retrieve({ page_id: pageId }),
			n2m.pageToMarkdown(pageId)
		]);

		const mdString = n2m.toMarkdownString(mdblocks);
		const markdownContent = mdString.parent; // This is your article body!

		const properties = (response as any).properties as Record<string, any>;
		const extractText = (prop: any) =>
			prop?.rich_text?.map((t: any) => t.plain_text).join('') || '';

		const notionData = {
			id: pageId as string,
			title:
				properties['Name']?.title?.map((t: any) => t.plain_text).join('') ||
				properties['Title']?.title?.map((t: any) => t.plain_text).join('') ||
				'Untitled',
			slug: extractText(properties['Slug']),
			summary: extractText(properties['Summary']),
			metaTitle: extractText(properties['Meta Title']),
			metaDescription: extractText(properties['Meta Description']),
			canonicalUrl: properties['Canonical URL']?.url || null,
			featuredImage: properties['Featured Image']?.url || null,
			noIndex: properties['No index']?.checkbox || false,
			publishedDate: properties['Published date']?.date?.start || null,
			updatedDate:
				properties['Updated date']?.date?.start ||
				properties['Updated date']?.last_edited_time ||
				null,
			status: properties['Status']?.status?.name || null,
			tags: properties['Tags']?.multi_select?.map((tag: any) => tag.name) || [],

			// 👈 4. Store the clean Markdown string instead of raw blocks
			content: markdownContent
		};

		console.log(`\n✅ Successfully converted article: ${notionData.title}`);
		console.log(`📝 Content length: ${markdownContent.length} characters`);
		console.log('📦 Notion data:', JSON.stringify(notionData, null, 2));

		// --------------------------------------------------
		// 4. SAVE TO YOUR DATABASE HERE
		// --------------------------------------------------
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
