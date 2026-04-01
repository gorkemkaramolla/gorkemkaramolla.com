import { describe, expect, it } from 'vitest';

import { filterEmojiGroups, getScriptedReply } from './contact-concierge.logic';

describe('contact concierge logic', () => {
	it('matches project-oriented prompts to the project reply bucket', () => {
		const result = getScriptedReply('We need help building a product interface.');

		expect(result.bucket).toBe('project');
		expect(result.content).toContain('scope');
	});

	it('matches hire prompts to the hire reply bucket', () => {
		expect(getScriptedReply('I want to hire you for a contract role.').bucket).toBe('hire');
	});

	it('matches collaboration prompts to the collab reply bucket', () => {
		expect(getScriptedReply('Could we collaborate on this launch?').bucket).toBe('collab');
	});

	it('matches CV prompts to the cv reply bucket', () => {
		expect(getScriptedReply('Can you send your CV?').bucket).toBe('cv');
	});

	it('matches timing prompts to the availability reply bucket', () => {
		expect(getScriptedReply('What is your availability next month?').bucket).toBe('availability');
	});

	it('falls back when no keyword is matched', () => {
		expect(getScriptedReply('Hello there').bucket).toBe('fallback');
	});

	it('filters the emoji list by keyword', () => {
		const groups = filterEmojiGroups('mail');

		expect(groups).toHaveLength(1);
		expect(groups[0]?.items.some((item) => item.symbol === '📬')).toBe(true);
	});
});
