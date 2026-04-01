import type { ChatMessage, OrbitAction } from './contact.types';

type ReplyBucketId = 'project' | 'hire' | 'collab' | 'cv' | 'availability' | 'fallback';

type ReplyBucket = {
	id: ReplyBucketId;
	keywords: string[];
	reply: string;
};

type CuratedEmojiGroup = {
	label: string;
	items: Array<{
		symbol: string;
		name: string;
		keywords: string[];
	}>;
};

const replyBuckets: ReplyBucket[] = [
	{
		id: 'project',
		keywords: ['project', 'product', 'app', 'website', 'build', 'system', 'interface'],
		reply:
			'If the project is worth building carefully, send the scope, the constraint that matters most, and the timeline. I will keep the next step direct.'
	},
	{
		id: 'hire',
		keywords: ['hire', 'job', 'role', 'freelance', 'contract', 'position'],
		reply:
			'If this is about a role or contract, send the team stage, scope, and timing. The CV slot in orbit is turning into a downloadable PDF, but email is still the cleanest place for specifics.'
	},
	{
		id: 'collab',
		keywords: ['collab', 'collaborate', 'partnership', 'together', 'team up', 'partner'],
		reply:
			'For collaborations, tell me what each side brings and what outcome should exist at the end. Concrete scopes move faster than vague partnerships.'
	},
	{
		id: 'cv',
		keywords: ['cv', 'resume', 'experience', 'background', 'portfolio'],
		reply:
			'The CV action stays in the floating orbit and will become a direct PDF download. Until that is live, email is the cleanest route if you need the latest version.'
	},
	{
		id: 'availability',
		keywords: ['available', 'availability', 'start', 'timeline', 'schedule', 'capacity'],
		reply:
			'Availability depends on scope and start window. Leave your email with the expected timing and I can answer with a realistic next step.'
	},
	{
		id: 'fallback',
		keywords: [],
		reply:
			'Tell me what you are building, what outcome you want, and why now. I prefer a precise brief over a long intro.'
	}
];

export const curatedEmojiGroups: CuratedEmojiGroup[] = [
	{
		label: 'Signals',
		items: [
			{ symbol: '👋', name: 'wave', keywords: ['hello', 'hi', 'wave'] },
			{ symbol: '🙂', name: 'smile', keywords: ['smile', 'friendly'] },
			{ symbol: '🔥', name: 'fire', keywords: ['fire', 'strong', 'hot'] },
			{ symbol: '✨', name: 'sparkles', keywords: ['sparkle', 'polish', 'shine'] }
		]
	},
	{
		label: 'Work',
		items: [
			{ symbol: '💻', name: 'laptop', keywords: ['code', 'software', 'laptop'] },
			{ symbol: '🛠️', name: 'tools', keywords: ['build', 'tools', 'craft'] },
			{ symbol: '📬', name: 'mailbox', keywords: ['mail', 'inbox', 'email'] },
			{ symbol: '📄', name: 'document', keywords: ['cv', 'resume', 'document'] }
		]
	},
	{
		label: 'Tempo',
		items: [
			{ symbol: '⚡', name: 'lightning', keywords: ['fast', 'quick', 'lightning'] },
			{ symbol: '🕰️', name: 'clock', keywords: ['time', 'timeline', 'clock'] },
			{ symbol: '🚀', name: 'rocket', keywords: ['launch', 'rocket', 'ship'] },
			{ symbol: '🤝', name: 'handshake', keywords: ['collab', 'team', 'partnership'] }
		]
	}
];

export const orbitActionOffsets: Record<OrbitAction, { x: number; y: number; delayMs: number }> = {
	chat: { x: -118, y: -20, delayMs: 0 },
	mail: { x: -100, y: -92, delayMs: 45 },
	cv: { x: -36, y: -146, delayMs: 90 }
};

export function createChatMessage(
	id: string,
	role: ChatMessage['role'],
	content: string,
	kind: ChatMessage['kind'] = 'text'
): ChatMessage {
	return {
		id,
		role,
		content,
		kind
	};
}

export function getScriptedReply(input: string): { bucket: ReplyBucketId; content: string } {
	const normalizedInput = input.trim().toLowerCase();

	if (!normalizedInput) {
		return {
			bucket: 'fallback',
			content: replyBuckets.at(-1)?.reply ?? ''
		};
	}

	const matchedBucket =
		replyBuckets.find(
			(bucket) =>
				bucket.id !== 'fallback' &&
				bucket.keywords.some((keyword) => normalizedInput.includes(keyword))
		) ?? replyBuckets.at(-1);

	return {
		bucket: matchedBucket?.id ?? 'fallback',
		content: matchedBucket?.reply ?? ''
	};
}

export function filterEmojiGroups(searchValue: string) {
	const normalizedSearch = searchValue.trim().toLowerCase();

	if (!normalizedSearch) {
		return curatedEmojiGroups;
	}

	return curatedEmojiGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => {
				const haystack = `${item.symbol} ${item.name} ${item.keywords.join(' ')}`.toLowerCase();
				return haystack.includes(normalizedSearch);
			})
		}))
		.filter((group) => group.items.length > 0);
}
