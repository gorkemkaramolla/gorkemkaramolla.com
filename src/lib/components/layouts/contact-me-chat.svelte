<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onDestroy, tick } from 'svelte';

	import Button from '$lib/components/ui/button.svelte';
	import YaruCard from '$lib/components/ui/yaru-card.svelte';

	import {
		createChatMessage,
		filterEmojiGroups,
		getScriptedReply,
		orbitActionOffsets
	} from '$lib/contact/contact-chat.logic';
	import { loadChatState, saveChatState } from '$lib/contact/contact-chat-storage';
	import type { ContactLeadPayload, OrbitAction } from '$lib/contact/contact.types';
	import { siteConfig } from '$lib/config/site-config';
	import { cn } from '$lib/utils';

	type ActiveSurface = 'chat' | 'cv' | null;
	type LeadState = {
		status: 'idle' | 'submitting' | 'success' | 'error';
		message: string;
	};

	const orbitActions = siteConfig.contactWidget.orbitActions;
	const floatingPanelClass = 'orbit-surface orbit-surface--panel';
	const orbitButtonClass = 'orbit-surface orbit-surface--button';
	const mainFabClass = 'orbit-surface orbit-surface--fab';
	const leadSuccessMessage = "Thanks — I've got your email and I'll be in touch.";

	const storedChat = browser ? loadChatState() : null;

	let messageSequence = storedChat?.sequence ?? 0;
	let replyTimer: number | null = null;
	let copyResetTimer: number | null = null;
	let transcriptEl = $state<HTMLDivElement | null>(null);
	let orbitRootEl = $state<HTMLDivElement | null>(null);

	let activeSurface = $state<ActiveSurface>(storedChat?.open ? 'chat' : null);
	let isOrbitOpen = $state(false);
	let isPrimaryFabActive = $derived(activeSurface !== null || isOrbitOpen);
	let isChatCollapsed = $state(false);
	let isEmojiPickerOpen = $state(false);
	let emojiSearch = $state('');
	let composerValue = $state('');
	let copiedEmail = $state(false);
	let isReplying = $state(false);
	let hasPromptedForEmail = $state(storedChat?.prompted ?? false);
	let chatEmail = $state(storedChat?.email ?? '');
	let chatLeadState = $state<LeadState>(
		storedChat?.leadCaptured
			? { status: 'success', message: leadSuccessMessage }
			: { status: 'idle', message: '' }
	);
	let messages = $state(
		storedChat?.messages ?? [
			createChatMessage(
				nextMessageId('assistant'),
				'assistant',
				siteConfig.contactWidget.greeting,
				'system'
			)
		]
	);
	let filteredEmojiGroups = $derived(filterEmojiGroups(emojiSearch));

	$effect(() => {
		if (!browser) return;

		saveChatState({
			messages,
			sequence: messageSequence,
			email: chatEmail,
			leadCaptured: chatLeadState.status === 'success',
			prompted: hasPromptedForEmail,
			open: activeSurface === 'chat'
		});
	});

	function nextMessageId(role: 'assistant' | 'user') {
		messageSequence += 1;
		return `${role}-${messageSequence}`;
	}

	function closePanels() {
		activeSurface = null;
		isChatCollapsed = false;
		isEmojiPickerOpen = false;
		emojiSearch = '';
	}

	function handlePrimaryAction() {
		if (activeSurface) {
			closePanels();
			return;
		}

		isOrbitOpen = !isOrbitOpen;
	}

	function openChat() {
		activeSurface = 'chat';
		isOrbitOpen = false;
		isChatCollapsed = false;
		isEmojiPickerOpen = false;
	}

	function openCvCard() {
		activeSurface = 'cv';
		isOrbitOpen = false;
		isChatCollapsed = false;
		isEmojiPickerOpen = false;
	}

	function handleOrbitAction(action: OrbitAction) {
		if (action === 'chat') {
			openChat();
			return;
		}

		if (action === 'cv') {
			openCvCard();
			return;
		}

		if (action === 'linkedin') {
			window.open(siteConfig.authorLinkedin, '_blank', 'noopener,noreferrer');
			isOrbitOpen = false;
			return;
		}

		if (action === 'github') {
			window.open(siteConfig.authorGithub, '_blank', 'noopener,noreferrer');
			isOrbitOpen = false;
			return;
		}
	}

	function handleEscape(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;

		if (isEmojiPickerOpen) {
			isEmojiPickerOpen = false;
			return;
		}

		if (activeSurface) {
			closePanels();
			return;
		}

		if (isOrbitOpen) {
			isOrbitOpen = false;
		}
	}

	function handleWindowPointerDown(event: PointerEvent) {
		if (!isOrbitOpen && !activeSurface) return;

		const target = event.target;
		if (!(target instanceof Node)) return;
		if (orbitRootEl?.contains(target)) return;

		if (activeSurface) {
			closePanels();
			return;
		}

		isOrbitOpen = false;
	}

	function queueAssistantReply(userMessage: string) {
		if (replyTimer) {
			clearTimeout(replyTimer);
		}

		const reply = getScriptedReply(userMessage);
		isReplying = true;

		replyTimer = window.setTimeout(async () => {
			messages = [
				...messages,
				createChatMessage(nextMessageId('assistant'), 'assistant', reply.content)
			];
			isReplying = false;

			if (chatLeadState.status !== 'success') {
				hasPromptedForEmail = true;
			}

			await tick();
			scrollTranscriptToBottom();
		}, 260);
	}

	function scrollTranscriptToBottom() {
		if (!transcriptEl) return;
		transcriptEl.scrollTo({
			top: transcriptEl.scrollHeight,
			behavior: 'smooth'
		});
	}

	function handleChatSubmit() {
		const nextMessage = composerValue.trim();

		if (!nextMessage || isReplying) return;

		messages = [...messages, createChatMessage(nextMessageId('user'), 'user', nextMessage)];
		composerValue = '';
		isEmojiPickerOpen = false;
		emojiSearch = '';

		queueAssistantReply(nextMessage);

		void tick().then(scrollTranscriptToBottom);
	}

	function handleComposerKeydown(event: KeyboardEvent) {
		// Enter sends; Shift+Enter keeps the newline. Skip while an IME is composing.
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			handleChatSubmit();
		}
	}

	function appendEmoji(symbol: string) {
		composerValue = `${composerValue}${symbol}`;
		isEmojiPickerOpen = false;
		emojiSearch = '';
	}

	async function submitLead() {
		const email = chatEmail.trim();

		if (!email) {
			chatLeadState = { status: 'error', message: 'Add an email address first.' };
			return;
		}

		if (chatLeadState.status === 'submitting') return;

		chatLeadState = { status: 'submitting', message: '' };

		const payload: ContactLeadPayload = {
			email,
			message: messages.find((message) => message.role === 'user')?.content,
			transcript: messages,
			sourcePath: page.url.pathname,
			sourceSurface: 'chat'
		};

		try {
			const response = await fetch('/api/contact-leads', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = (await response.json()) as { success: boolean; error?: string };

			if (!response.ok || !result.success) {
				throw new Error(result.error ?? 'Request failed.');
			}

			chatLeadState = { status: 'success', message: leadSuccessMessage };
		} catch (error) {
			chatLeadState = {
				status: 'error',
				message: error instanceof Error ? error.message : 'Could not store your email right now.'
			};
		}
	}

	onDestroy(() => {
		if (replyTimer) {
			clearTimeout(replyTimer);
		}

		if (copyResetTimer) {
			clearTimeout(copyResetTimer);
		}
	});
</script>

<svelte:window onkeydown={handleEscape} onpointerdown={handleWindowPointerDown} />

<div
	bind:this={orbitRootEl}
	class="pointer-events-none fixed right-3 bottom-3 z-[70] sm:right-6 sm:bottom-6 print:hidden"
	style="padding-right: max(0rem, env(safe-area-inset-right)); padding-bottom: max(0rem, env(safe-area-inset-bottom));"
>
	<div class="relative flex flex-col items-end gap-4">
		{#if activeSurface === 'chat'}
			<YaruCard
				title={siteConfig.contactWidget.assistantName}
				titleId="contact-chat-title"
				role="dialog"
				aria-labelledby="contact-chat-title"
				onMinimize={() => {
					isChatCollapsed = true;
					isEmojiPickerOpen = false;
				}}
				onMaximize={() => {
					isChatCollapsed = false;
					isEmojiPickerOpen = false;
				}}
				onClose={closePanels}
				bodyClass="flex flex-col"
				class={cn(
					'pointer-events-auto absolute right-0 bottom-20 transition-[width,height,opacity,transform] duration-300 ease-out',
					isChatCollapsed
						? 'h-[min(calc(100vh-7.5rem),34rem)] w-[min(calc(100vw-1.5rem),24.5rem)] translate-y-0 opacity-100'
						: 'h-[min(calc(100vh-7.5rem),46rem)] w-[min(calc(100vw-1.5rem),43rem)] translate-y-0 opacity-100'
				)}
			>
					<div
						bind:this={transcriptEl}
						class={cn(
							'orbit-chat-transcript min-h-0 flex-1 space-y-4 overflow-y-auto',
							isChatCollapsed ? 'px-4 py-4' : 'px-6 py-6'
						)}
						aria-live="polite"
					>
						{#each messages as message (message.id)}
							{#if message.kind === 'system'}
								<p
									class={cn(
										'mx-auto max-w-[34ch] text-center text-[0.95rem] leading-7 text-muted-foreground',
										isChatCollapsed ? 'pt-1' : 'pt-2'
									)}
								>
									{message.content}
								</p>
							{:else}
								<div class={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
									<div
										class={cn(
											'max-w-[80%] rounded-[1.4rem] px-4 py-3 text-[0.95rem] leading-7',
											message.role === 'user'
												? 'orbit-chat-user-bubble rounded-br-[0.6rem]'
												: 'orbit-chat-assistant-bubble rounded-bl-[0.6rem]'
										)}
									>
										{message.content}
									</div>
								</div>
							{/if}
						{/each}

						{#if isReplying}
							<div class="flex justify-start">
								<div
									class="orbit-chat-assistant-bubble rounded-[1.4rem] rounded-bl-[0.6rem] px-4 py-3 text-[0.95rem]"
								>
									Routing the cleanest answer...
								</div>
							</div>
						{/if}

						{#if hasPromptedForEmail || chatLeadState.status !== 'idle'}
							<div class="orbit-chat-card rounded-[1.6rem] p-5">
								<p class="text-sm font-semibold text-foreground">Leave your email</p>
								<p class="mt-1 text-sm leading-6 text-muted-foreground">
									Drop your address and I'll follow up directly.
								</p>

								{#if chatLeadState.status === 'success'}
									<div class="orbit-chat-success mt-4 rounded-[1.3rem] p-4">
										<p class="text-sm font-medium text-foreground">{chatLeadState.message}</p>
										<p class="mt-2 text-sm text-muted-foreground">{chatEmail}</p>
									</div>
								{:else}
									<form
										class="mt-4 flex flex-col gap-3 sm:flex-row"
										onsubmit={(event) => {
											event.preventDefault();
											void submitLead();
										}}
									>
										<input
											bind:value={chatEmail}
											type="email"
											inputmode="email"
											autocomplete="email"
											placeholder="email@example.com"
											class="orbit-chat-email-input min-w-0 flex-1 rounded-full px-4 py-3 text-sm placeholder:text-muted-foreground/55 focus:border-chat focus:ring-2 focus:ring-chat/15"
										/>
										<Button
											type="submit"
											class="orbit-chat-primary-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-chat/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
											disabled={chatLeadState.status === 'submitting'}
										>
											{chatLeadState.status === 'submitting' ? 'Saving...' : 'Notify me'}
										</Button>
									</form>

									{#if chatLeadState.status === 'error'}
										<p class="mt-3 text-sm text-chat-danger">{chatLeadState.message}</p>
									{/if}
								{/if}
							</div>
						{/if}
					</div>

					<div
						class={cn(
							'orbit-chat-footer border-t',
							isChatCollapsed ? 'px-4 py-4' : 'px-6 py-5'
						)}
					>
						<form
							class="orbit-chat-composer relative rounded-[1.5rem] p-3"
							onsubmit={(event) => {
								event.preventDefault();
								handleChatSubmit();
							}}
						>
							<label class="sr-only" for="chat-message">Message</label>
							<textarea
								id="chat-message"
								bind:value={composerValue}
								onkeydown={handleComposerKeydown}
								rows="2"
								placeholder="Message..."
								class={cn(
									'orbit-chat-textarea w-full resize-none border-0 bg-transparent px-1 py-1 text-[0.95rem] leading-6 placeholder:text-muted-foreground/55 focus:ring-0',
									isChatCollapsed ? 'min-h-[4.75rem]' : 'min-h-[5.75rem]'
								)}
							></textarea>

							<div class="mt-2 flex items-center justify-between gap-3">
								<div class="relative flex items-center gap-2">
									<Button
										type="button"
										onclick={() => {
											isEmojiPickerOpen = !isEmojiPickerOpen;
										}}
										class="orbit-chat-action-button inline-flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-chat/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
										aria-label="Toggle emoji picker"
										aria-expanded={isEmojiPickerOpen}
									>
										<svg
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.8"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="h-4 w-4"
										>
											<circle cx="12" cy="12" r="9"></circle>
											<path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
											<path d="M9 9h.01"></path>
											<path d="M15 9h.01"></path>
										</svg>
									</Button>

									{#if isEmojiPickerOpen}
										<div
											class="orbit-emoji-popover absolute bottom-12 left-0 z-10 w-72 rounded-[1.4rem] p-3"
										>
											<input
												bind:value={emojiSearch}
												type="search"
												placeholder="Search emoji..."
												class="orbit-emoji-search w-full rounded-full px-4 py-2 text-sm placeholder:text-muted-foreground/55 focus:border-chat focus:ring-2 focus:ring-chat/20"
											/>

											<div class="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
												{#if filteredEmojiGroups.length > 0}
													{#each filteredEmojiGroups as group (group.label)}
														<div class="space-y-2">
															<p
																class="orbit-emoji-label text-[0.62rem] font-semibold tracking-[0.22em] uppercase"
															>
																{group.label}
															</p>
															<div class="flex flex-wrap gap-2">
																{#each group.items as item (item.symbol)}
																	<Button
																		type="button"
																		onclick={() => appendEmoji(item.symbol)}
																		class="orbit-emoji-option inline-flex h-10 w-10 items-center justify-center rounded-full text-lg transition focus-visible:ring-2 focus-visible:ring-[#60a5fa]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] focus-visible:outline-none"
																		aria-label={item.name}
																	>
																		{item.symbol}
																	</Button>
																{/each}
															</div>
														</div>
													{/each}
												{:else}
													<p class="orbit-emoji-empty text-sm">No emoji matched that search.</p>
												{/if}
											</div>
										</div>
									{/if}
								</div>

								<Button
									type="submit"
									class="orbit-chat-send-button inline-flex h-11 w-11 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-chat/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed"
									disabled={composerValue.trim().length === 0 || isReplying}
									aria-label="Send message"
								>
									<svg
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.8"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="h-4 w-4"
									>
										<path d="M12 5v14"></path>
										<path d="m18 11-6-6-6 6"></path>
									</svg>
								</Button>
							</div>
						</form>
					</div>
			</YaruCard>
		{/if}

		{#if activeSurface === 'cv'}
			<div
				role="dialog"
				aria-label="CV PDF"
				class={`pointer-events-auto absolute right-0 bottom-20 w-[min(calc(100vw-1.5rem),23rem)] overflow-hidden rounded-[2rem] ${floatingPanelClass} p-4 backdrop-blur-2xl sm:w-[22rem]`}
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-[0.65rem] font-semibold tracking-[0.24em] text-brand/80 uppercase">
							CV PDF
						</p>
						<p class="mt-2 text-sm leading-7 text-muted-foreground">
							A downloadable PDF version of my CV is on the way.
						</p>
					</div>

					<Button
						type="button"
						onclick={closePanels}
						class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/55 text-muted-foreground transition hover:border-brand/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
						aria-label="Close CV card"
					>
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="M18 6 6 18"></path>
							<path d="m6 6 12 12"></path>
						</svg>
					</Button>
				</div>

				<div class="mt-5 rounded-[1.6rem] border border-border/70 bg-background/55 p-4">
					<p class="text-sm font-semibold text-foreground">Download coming soon</p>
					<p class="mt-1 text-sm leading-6 text-muted-foreground">
						Once it's ready, this will download the PDF directly.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<span
							class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
						>
							PDF soon
						</span>
					</div>
				</div>
			</div>
		{/if}

		<div
			class="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rounded-full border border-black/8 [mask-image:radial-gradient(circle_at_bottom_right,transparent_34%,black_35%,black_67%,transparent_69%)] dark:border-white/8"
		></div>

		{#each orbitActions as action (action.id)}
			<Button
				type="button"
				onclick={() => void handleOrbitAction(action.id)}
				class={cn(
					`pointer-events-auto absolute right-1 bottom-1 inline-flex origin-bottom-right items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-foreground ${orbitButtonClass} transition-[transform,opacity,border-color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none`,
					isOrbitOpen && !activeSurface
						? 'translate-x-0 translate-y-0 opacity-100'
						: 'pointer-events-none translate-x-0 translate-y-0 opacity-0'
				)}
				style={`transform: translate(${isOrbitOpen && !activeSurface ? orbitActionOffsets[action.id].x : 0}px, ${isOrbitOpen && !activeSurface ? orbitActionOffsets[action.id].y : 0}px) scale(${isOrbitOpen && !activeSurface ? 1 : 0.72}); transition-delay: ${isOrbitOpen && !activeSurface ? orbitActionOffsets[action.id].delayMs : 0}ms;`}
				aria-hidden={!isOrbitOpen || !!activeSurface}
				aria-label={action.label}
			>
				<span
					class={cn(
						'inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/60 text-muted-foreground',
						action.id === 'chat' && 'text-brand-strong dark:text-brand-soft',
						action.id === 'cv' && 'text-emerald-600 dark:text-emerald-300',
						action.id === 'linkedin' && 'text-sky-600 dark:text-sky-400',
						action.id === 'github' && 'text-violet-600 dark:text-violet-400'
					)}
				>
					{#if action.id === 'chat'}
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="M7 10h10"></path>
							<path d="M7 14h6"></path>
							<path d="M5 19V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-4 4Z"></path>
						</svg>
					{:else if action.id === 'cv'}
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-4 w-4"
						>
							<path d="M6 3h9l3 3v15H6z"></path>
							<path d="M14 3v4h4"></path>
							<path d="M9 13h6"></path>
							<path d="M9 17h6"></path>
						</svg>
					{:else if action.id === 'linkedin'}
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="h-4 w-4"
						>
							<path d="M6.94 8.5H3.56V20h3.38zm.22-5.1a1.97 1.97 0 0 0-2.03-1.9A1.96 1.96 0 0 0 3.1 3.4a1.97 1.97 0 0 0 2.03 1.92A1.98 1.98 0 0 0 7.16 3.4M20.9 12.03c0-3.44-1.83-5.04-4.28-5.04-1.97 0-2.85 1.08-3.34 1.84V8.5H9.9c.04.87 0 11.5 0 11.5h3.38v-6.42c0-.35.03-.7.13-.95.27-.7.89-1.42 1.92-1.42 1.35 0 1.9 1.03 1.9 2.54V20h3.38z"></path>
						</svg>
					{:else}
						<svg
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							class="h-4 w-4"
						>
							<path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"></path>
						</svg>
					{/if}
				</span>
				<span class="pr-1">{action.label}</span>
			</Button>
		{/each}

		<Button
			type="button"
			onclick={handlePrimaryAction}
			class={`pointer-events-auto relative inline-flex h-16 w-16 items-center justify-center rounded-full text-foreground ${mainFabClass} transition hover:border-brand/35 hover:text-brand-strong focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none dark:hover:text-brand-soft`}
			aria-label={isPrimaryFabActive ? 'Close contact controls' : 'Open contact controls'}
			aria-expanded={isOrbitOpen}
		>
			<span class="absolute inset-1 rounded-full border border-black/8 dark:border-white/8"></span>
			<span
				class="absolute h-9 w-9 rounded-full border border-brand/16 bg-brand/6 blur-sm"
			></span>
			<span
				class={cn(
					'orbit-fab-icon-stack relative inline-flex h-8 w-8 items-center justify-center',
					isPrimaryFabActive && 'orbit-fab-icon-stack--active'
				)}
			>
				<svg
					focusable="false"
					aria-hidden="true"
					viewBox="0 0 28 32"
					class={cn(
						'orbit-fab-icon orbit-fab-icon--chat h-7 w-6 fill-current',
						isPrimaryFabActive && 'orbit-fab-icon--inactive'
					)}
				>
					<path
						d="M28,32 C28,32 23.2863266,30.1450667 19.4727818,28.6592 L3.43749107,28.6592 C1.53921989,28.6592 0,27.0272 0,25.0144 L0,3.6448 C0,1.632 1.53921989,0 3.43749107,0 L24.5615088,0 C26.45978,0 27.9989999,1.632 27.9989999,3.6448 L27.9989999,22.0490667 L28,22.0490667 L28,32 Z M23.8614088,20.0181333 C23.5309223,19.6105242 22.9540812,19.5633836 22.5692242,19.9125333 C22.5392199,19.9392 19.5537934,22.5941333 13.9989999,22.5941333 C8.51321617,22.5941333 5.48178311,19.9584 5.4277754,19.9104 C5.04295119,19.5629428 4.46760991,19.6105095 4.13759108,20.0170667 C3.97913051,20.2124916 3.9004494,20.4673395 3.91904357,20.7249415 C3.93763774,20.9825435 4.05196575,21.2215447 4.23660523,21.3888 C4.37862552,21.5168 7.77411059,24.5386667 13.9989999,24.5386667 C20.2248893,24.5386667 23.6203743,21.5168 23.7623946,21.3888 C23.9467342,21.2215726 24.0608642,20.9827905 24.0794539,20.7254507 C24.0980436,20.4681109 24.0195551,20.2135019 23.8614088,20.0181333 Z"
					></path>
				</svg>
				<svg
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.9"
					stroke-linecap="round"
					stroke-linejoin="round"
					class={cn(
						'orbit-fab-icon orbit-fab-icon--chevron h-5 w-5',
						isPrimaryFabActive && 'orbit-fab-icon--active'
					)}
				>
					<path d="m6 9 6 6 6-6"></path>
				</svg>
			</span>
		</Button>
	</div>
</div>

<style>
	.orbit-surface {
		border: 1px solid hsl(var(--border) / 0.72);
	}

	.orbit-surface--panel {
		background:
			radial-gradient(circle at top, color-mix(in srgb, var(--color-brand) 11%, transparent), transparent 52%),
			linear-gradient(180deg, rgb(255 255 255 / 0.94), rgb(244 246 251 / 0.98));
		box-shadow: 0 28px 90px rgb(148 163 184 / 0.24);
	}

	.orbit-surface--button {
		background: linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(244 246 251 / 0.98));
		box-shadow: 0 18px 45px rgb(148 163 184 / 0.22);
	}

	.orbit-surface--fab {
		background: linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(242 244 250 / 0.98));
		box-shadow: 0 24px 55px rgb(148 163 184 / 0.24);
	}

	.orbit-fab-icon-stack {
		isolation: isolate;
	}

	.orbit-fab-icon {
		position: absolute;
		inset: 0;
		margin: auto;
		transform-origin: 50% 58%;
		transition:
			transform 340ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 240ms ease,
			filter 280ms ease;
		will-change: transform, opacity, filter;
	}

	.orbit-fab-icon--chat {
		opacity: 1;
		transform: translate3d(0, 0, 0) scale(1);
	}

	.orbit-fab-icon--chat.orbit-fab-icon--inactive {
		opacity: 0;
		filter: blur(1px);
		transform: translate3d(0, 0.3rem, 0) scale(0.42);
	}

	.orbit-fab-icon--chevron {
		opacity: 0;
		filter: blur(1px);
		transform: translate3d(0, -0.45rem, 0) scale(0.34);
	}

	.orbit-fab-icon--chevron.orbit-fab-icon--active {
		opacity: 1;
		filter: blur(0);
		transform: translate3d(0, 0, 0) scale(1);
		animation: orbit-fab-chevron-pop 360ms cubic-bezier(0.2, 0.9, 0.2, 1) both;
	}

	@keyframes orbit-fab-chevron-pop {
		0% {
			opacity: 0;
			transform: translate3d(0, -0.45rem, 0) scale(0.34);
		}

		68% {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1.12);
		}

		100% {
			opacity: 1;
			transform: translate3d(0, 0, 0) scale(1);
		}
	}

	/* Window chrome (frame, titlebar, controls) lives in YaruCard; the rules below
	   style the chat body and inherit the --yaru-* custom properties from it. */
	.orbit-chat-transcript {
		background: var(--yaru-body);
	}

	.orbit-chat-assistant-bubble {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body-2);
		color: var(--yaru-text);
	}

	.orbit-chat-user-bubble {
		background: linear-gradient(180deg, var(--color-brand), var(--color-brand-strong));
		box-shadow: 0 14px 30px color-mix(in srgb, var(--color-brand) 26%, transparent);
		color: #fff;
	}

	.orbit-chat-card {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body-2);
	}

	.orbit-chat-success {
		border: 1px solid color-mix(in srgb, var(--color-brand) 36%, var(--yaru-border));
		background: color-mix(in srgb, var(--color-brand) 9%, var(--yaru-body));
	}

	.orbit-chat-email-input {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body);
		color: var(--yaru-text);
	}

	.orbit-chat-email-input:focus {
		border-color: var(--color-brand);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 22%, transparent);
		outline: none;
	}

	.orbit-chat-primary-button {
		border: 1px solid transparent;
		background: var(--color-brand);
		color: #fff;
	}

	.orbit-chat-primary-button:hover {
		filter: brightness(1.05);
	}

	.orbit-chat-footer {
		border-top-color: var(--yaru-titlebar-border);
		background: var(--yaru-titlebar);
	}

	.orbit-chat-composer {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body);
		box-shadow: none;
	}

	.orbit-chat-composer:focus-within {
		border-color: var(--color-brand);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-brand) 18%, transparent);
	}

	.orbit-chat-textarea {
		color: var(--yaru-text);
	}

	.orbit-chat-action-button {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body-2);
		color: var(--yaru-muted);
	}

	.orbit-chat-action-button:hover {
		border-color: color-mix(in srgb, var(--color-brand) 45%, var(--yaru-border));
		background: color-mix(in srgb, var(--color-brand) 10%, var(--yaru-body));
		color: var(--color-brand);
	}

	.orbit-chat-send-button {
		background: linear-gradient(180deg, var(--color-brand), var(--color-brand-strong));
		box-shadow: 0 14px 28px color-mix(in srgb, var(--color-brand) 26%, transparent);
		color: #fff;
	}

	.orbit-chat-send-button:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	.orbit-chat-send-button:disabled {
		background: var(--yaru-control);
		box-shadow: none;
		color: var(--yaru-muted);
	}

	.orbit-emoji-popover {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body);
		box-shadow: 0 20px 50px rgb(0 0 0 / 0.18);
		color: var(--yaru-text);
	}

	.orbit-emoji-search {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body-2);
		color: var(--yaru-text);
	}

	.orbit-emoji-label {
		color: var(--yaru-muted);
	}

	.orbit-emoji-option {
		border: 1px solid var(--yaru-border);
		background: var(--yaru-body-2);
	}

	.orbit-emoji-option:hover {
		border-color: color-mix(in srgb, var(--color-brand) 45%, var(--yaru-border));
		background: color-mix(in srgb, var(--color-brand) 10%, var(--yaru-body));
		transform: translateY(-1px);
	}

	.orbit-emoji-empty {
		color: var(--yaru-muted);
	}

	:global(.dark) .orbit-surface {
		border-color: rgb(255 255 255 / 0.1);
	}

	:global(.dark) .orbit-surface--panel {
		background:
			radial-gradient(circle at top, color-mix(in srgb, var(--color-brand) 12%, transparent), transparent 52%),
			linear-gradient(180deg, rgb(10 12 20 / 0.96), rgb(4 5 10 / 0.96));
		box-shadow: 0 28px 90px rgb(0 0 0 / 0.48);
	}

	:global(.dark) .orbit-surface--button {
		background: linear-gradient(180deg, rgb(12 14 24 / 0.95), rgb(6 8 14 / 0.95));
		box-shadow: 0 18px 45px rgb(0 0 0 / 0.35);
	}

	:global(.dark) .orbit-surface--fab {
		background: linear-gradient(180deg, rgb(16 18 28 / 0.98), rgb(8 10 18 / 0.98));
		box-shadow: 0 24px 55px rgb(0 0 0 / 0.45);
	}

</style>
