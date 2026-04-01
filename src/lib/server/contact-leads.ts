import type {
	ChatMessage,
	ContactLeadPayload,
	ContactLeadSourceSurface
} from '$lib/contact/contact.types';

export type ValidatedContactLeadPayload = {
	email: string;
	message: string | null;
	transcript: string;
	sourcePath: string;
	sourceSurface: ContactLeadSourceSurface;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function serializeTranscript(transcript: ChatMessage[]) {
	return JSON.stringify(
		transcript.map((message) => ({
			role: message.role,
			content: message.content.trim(),
			kind: message.kind
		}))
	);
}

export function validateContactLeadPayload(
	payload: unknown
): { success: true; data: ValidatedContactLeadPayload } | { success: false; error: string } {
	if (!payload || typeof payload !== 'object') {
		return { success: false, error: 'Invalid payload.' };
	}

	const input = payload as Partial<ContactLeadPayload>;
	const email = input.email?.trim().toLowerCase();

	if (!email || !EMAIL_PATTERN.test(email)) {
		return { success: false, error: 'A valid email address is required.' };
	}

	const sourcePath =
		typeof input.sourcePath === 'string' && input.sourcePath.startsWith('/')
			? input.sourcePath
			: '/';

	if (input.sourceSurface !== 'chat' && input.sourceSurface !== 'mail_card') {
		return { success: false, error: 'Invalid contact source.' };
	}

	const transcript: ChatMessage[] = Array.isArray(input.transcript)
		? input.transcript.filter((item: unknown): item is ChatMessage => {
				if (!item || typeof item !== 'object') {
					return false;
				}

				const candidate = item as Partial<ChatMessage>;

				return (
					(candidate.role === 'assistant' || candidate.role === 'user') &&
					(candidate.kind === 'text' || candidate.kind === 'system') &&
					typeof candidate.content === 'string'
				);
			})
		: [];

	const normalizedMessage =
		typeof input.message === 'string' && input.message.trim().length > 0
			? input.message.trim()
			: (transcript.find((item: ChatMessage) => item.role === 'user')?.content.trim() ?? null);

	if (normalizedMessage && normalizedMessage.length > 2000) {
		return { success: false, error: 'Message is too long.' };
	}

	return {
		success: true,
		data: {
			email,
			message: normalizedMessage,
			transcript: serializeTranscript(transcript),
			sourcePath,
			sourceSurface: input.sourceSurface
		}
	};
}
