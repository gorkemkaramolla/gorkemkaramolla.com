import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get('theme') ?? 'system';
	const isDark = theme === 'dark';

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('class=""', `class="${isDark ? 'dark' : ''}"`)
	});
};
