import { json } from '@sveltejs/kit';
import { Client } from '@notionhq/client';

// Initialize the Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST({ request }) {
	try {
		const payload = await request.json();

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

		// Fetch the full page properties from Notion
		const response = await notion.pages.retrieve({ page_id: pageId });
		const properties = response.properties;

		// Helper function for text fields
		const extractText = (prop) => prop?.rich_text?.map((t) => t.plain_text).join('') || '';

		// --------------------------------------------------
		// 3. COMPILE ALL DATA (Even if empty)
		// --------------------------------------------------
		// Looking closely at your screenshot, "Featured Image" has a link icon (🔗),
		// meaning it is a URL property, not a file upload property.

		const notionData = {
			id: pageId,

			// The default title column (usually "Name" or "Title")
			title:
				properties['Name']?.title?.map((t) => t.plain_text).join('') ||
				properties['Title']?.title?.map((t) => t.plain_text).join('') ||
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
			tags: properties['Tags']?.multi_select?.map((tag) => tag.name) || []
		};

		// Log it to your terminal so you can see exactly what Notion sent
		console.log('\n📦 Extracted Notion Data:');
		console.dir(notionData, { depth: null });

		// --------------------------------------------------
		// 4. SAVE TO YOUR DATABASE HERE
		// --------------------------------------------------
		// Example: await myDatabase.articles.upsert(notionData);

		// Return the compiled data in the response (useful for testing)
		return json({
			success: true,
			data: notionData
		});
	} catch (error) {
		console.error('Webhook processing error:', error);
		return json({ error: 'Failed to process webhook' }, { status: 500 });
	}
}
