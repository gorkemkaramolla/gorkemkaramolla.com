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
			"Sounds good. Send the scope, the main constraint, and your timeline, and I'll take it from there."
	},
	{
		id: 'hire',
		keywords: ['hire', 'job', 'role', 'freelance', 'contract', 'position'],
		reply:
			"Happy to talk. Tell me the team, the role, and the timing, then leave your email for the details."
	},
	{
		id: 'collab',
		keywords: ['collab', 'collaborate', 'partnership', 'together', 'team up', 'partner'],
		reply:
			'Tell me what each side brings and what success looks like. A clear scope beats a vague partnership.'
	},
	{
		id: 'cv',
		keywords: ['cv', 'resume', 'experience', 'background', 'portfolio'],
		reply:
			"I can send my latest CV by email. Leave your address and I'll forward it."
	},
	{
		id: 'availability',
		keywords: ['available', 'availability', 'start', 'timeline', 'schedule', 'capacity'],
		reply:
			"It depends on the scope and start date. Leave your email with the timing and I'll give you an honest answer."
	},
	{
		id: 'fallback',
		keywords: [],
		reply:
			"Tell me what you're building and what you need. A few specifics go a long way."
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
			{ symbol: '🛠️', name: 'tools', keywords: ['build', 'tools'] },
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
