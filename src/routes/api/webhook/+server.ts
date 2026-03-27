import { json } from '@sveltejs/kit';
import { Client } from '@notionhq/client';
import type { RequestHandler } from './$types';

// Initialize the Notion client.
// Note: We cast process.env.NOTION_API_KEY as a string to satisfy TypeScript.
const notion = new Client({ auth: process.env.NOTION_API_KEY as string });

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		// LOG RAW PAYLOAD for debugging
		console.log('\n📨 RAW NOTION PAYLOAD:', JSON.stringify(payload, null, 2), '\n');

		// 1. THE VERIFICATION CATCHER
		if (payload.verification_token) {
			console.log('\n🔥 NOTION VERIFICATION TOKEN:', payload.verification_token, '\n');
			return json({ success: true });
		}

		// 2. GET THE PAGE ID
		const pageId = payload.entity?.id || payload.data?.id;
		if (!pageId) {
			return json({ success: true, message: 'No page ID found' });
		}

		// Fetch all blocks with cursor-based pagination
		const fetchAllBlocks = async (blockId: string) => {
			const blocks: any[] = [];
			let cursor: string | undefined = undefined;
			do {
				const res = await notion.blocks.children.list({
					block_id: blockId,
					page_size: 100,
					...(cursor ? { start_cursor: cursor } : {})
				});
				blocks.push(...res.results);
				cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
			} while (cursor);
			return blocks;
		};

		// Fetch the full page properties and all blocks from Notion
		const [response, allBlocks] = await Promise.all([
			notion.pages.retrieve({ page_id: pageId }),
			fetchAllBlocks(pageId)
		]);

		// 🛠️ TYPE FIX: We cast properties to Record<string, any> to bypass Notion's
		// overly strict discriminated union types. This allows us to map the data cleanly.
		const properties = (response as any).properties as Record<string, any>;

		// 🛠️ TYPE FIX: Add 'any' to our helper parameters
		const extractText = (prop: any) =>
			prop?.rich_text?.map((t: any) => t.plain_text).join('') || '';

		// --------------------------------------------------
		// 3. COMPILE ALL DATA (Even if empty)
		// --------------------------------------------------
		const notionData = {
			id: pageId as string,

			// The default title column
			title:
				properties['Name']?.title?.map((t: any) => t.plain_text).join('') ||
				properties['Title']?.title?.map((t: any) => t.plain_text).join('') ||
				'',

			// Text Properties
			slug: extractText(properties['Slug']),
			summary: extractText(properties['Summary']),
			metaTitle: extractText(properties['Meta Title']),
			metaDescription: extractText(properties['Meta Description']),

			// URL Properties (🔗)
			canonicalUrl: properties['Canonical URL']?.url || null,
			featuredImage: properties['Featured Image']?.url || null,

			// Checkbox Properties (☑️)
			noIndex: properties['No index']?.checkbox || false,

			// Date Properties (📅)
			publishedDate: properties['Published date']?.date?.start || null,
			updatedDate:
				properties['Updated date']?.date?.start ||
				properties['Updated date']?.last_edited_time ||
				null,

			// Status Property (🚥)
			status: properties['Status']?.status?.name || null,

			// Multi-select Property (🏷️)
			tags: properties['Tags']?.multi_select?.map((tag: any) => tag.name) || [],

			// Page content blocks
			blocks: allBlocks
		};

		// Log it to your terminal
		console.log('\n📦 Extracted Notion Data:');
		console.dir(notionData, { depth: null });

		// --------------------------------------------------
		// 4. SAVE TO YOUR DATABASE HERE
		// --------------------------------------------------
		// Example: await myDatabase.articles.upsert(notionData);

		return json({
			success: true,
			data: notionData
		});
	} catch (error) {
		console.error('Webhook processing error:', error);
		return json({ error: 'Failed to process webhook' }, { status: 500 });
	}
};
