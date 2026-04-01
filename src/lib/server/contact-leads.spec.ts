import { describe, expect, it } from 'vitest';

import { validateContactLeadPayload } from './contact-leads';

describe('contact lead validation', () => {
	it('normalizes a valid chat payload and derives the first user message', () => {
		const result = validateContactLeadPayload({
			email: ' GORKEM@example.com ',
			transcript: [
				{ id: 'assistant-1', role: 'assistant', content: 'Hello', kind: 'system' },
				{ id: 'user-1', role: 'user', content: 'Need help with a project', kind: 'text' }
			],
			sourcePath: '/blog/example-post',
			sourceSurface: 'chat'
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.email).toBe('gorkem@example.com');
			expect(result.data.message).toBe('Need help with a project');
			expect(result.data.sourcePath).toBe('/blog/example-post');
			expect(result.data.transcript).toContain('"role":"assistant"');
		}
	});

	it('accepts a mail card payload without a message', () => {
		const result = validateContactLeadPayload({
			email: 'person@example.com',
			sourcePath: '/',
			sourceSurface: 'mail_card'
		});

		expect(result.success).toBe(true);

		if (result.success) {
			expect(result.data.message).toBeNull();
			expect(result.data.transcript).toBe('[]');
		}
	});

	it('rejects an invalid email', () => {
		const result = validateContactLeadPayload({
			email: 'nope',
			sourcePath: '/',
			sourceSurface: 'chat'
		});

		expect(result).toEqual({
			success: false,
			error: 'A valid email address is required.'
		});
	});

	it('rejects an unsupported source surface', () => {
		const result = validateContactLeadPayload({
			email: 'person@example.com',
			sourcePath: '/',
			sourceSurface: 'panel'
		});

		expect(result).toEqual({
			success: false,
			error: 'Invalid contact source.'
		});
	});
});
