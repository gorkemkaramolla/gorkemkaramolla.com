import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { db } from '$lib/server/db';
import { contactLead } from '$lib/server/db/schema';
import { validateContactLeadPayload } from '$lib/server/contact-leads';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();
		const validation = validateContactLeadPayload(payload);

		if (!validation.success) {
			return json(
				{
					success: false,
					error: validation.error
				},
				{ status: 400 }
			);
		}

		const [savedLead] = await db
			.insert(contactLead)
			.values(validation.data)
			.returning({ id: contactLead.id });

		return json({
			success: true,
			id: savedLead?.id ?? null
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';

		return json(
			{
				success: false,
				error: message
			},
			{ status: 500 }
		);
	}
};
