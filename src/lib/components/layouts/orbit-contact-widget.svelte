<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onDestroy, tick } from 'svelte';

	import {
		createChatMessage,
		filterEmojiGroups,
		getScriptedReply,
		orbitActionOffsets
	} from '$lib/contact/contact-concierge.logic';
	import type { ContactLeadPayload, OrbitAction } from '$lib/contact/contact.types';
	import { siteConfig } from '$lib/config/site-config';
	import { cn } from '$lib/utils';

	type ActiveSurface = 'chat' | 'mail' | 'cv' | null;
	type LeadState = {
		status: 'idle' | 'submitting' | 'success' | 'error';
		message: string;
	};

	const orbitActions = siteConfig.contactWidget.orbitActions;
	const mailtoHref = `mailto:${siteConfig.authorEmail}`;
	const assistantInitials = siteConfig.contactWidget.assistantName
		.split(' ')
		.map((part) => part[0] ?? '')
		.slice(0, 2)
		.join('')
		.toUpperCase();
	const floatingPanelClass = 'orbit-surface orbit-surface--panel';
	const orbitButtonClass = 'orbit-surface orbit-surface--button';
	const mainFabClass = 'orbit-surface orbit-surface--fab';
	const emojiPopoverClass = 'orbit-surface orbit-surface--popover';

	let messageSequence = 0;
	let replyTimer: number | null = null;
	let copyResetTimer: number | null = null;
	let transcriptEl = $state<HTMLDivElement | null>(null);
	let orbitRootEl = $state<HTMLDivElement | null>(null);

	let activeSurface = $state<ActiveSurface>(null);
	let isOrbitOpen = $state(false);
	let isPrimaryFabActive = $derived(activeSurface !== null || isOrbitOpen);
	let isChatCollapsed = $state(false);
	let isEmojiPickerOpen = $state(false);
	let emojiSearch = $state('');
	let composerValue = $state('');
	let copiedEmail = $state(false);
	let isReplying = $state(false);
	let hasPromptedForEmail = $state(false);
	let chatEmail = $state('');
	let mailCardEmail = $state('');
	let chatLeadState = $state<LeadState>({ status: 'idle', message: '' });
	let mailLeadState = $state<LeadState>({ status: 'idle', message: '' });
	let messages = $state([
		createChatMessage(
			nextMessageId('assistant'),
			'assistant',
			siteConfig.contactWidget.greeting,
			'system'
		)
	]);
	let filteredEmojiGroups = $derived(filterEmojiGroups(emojiSearch));

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

	function openMailCard() {
		activeSurface = 'mail';
		isOrbitOpen = false;
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

		if (action === 'mail') {
			openMailCard();
			return;
		}

		if (action === 'cv') {
			openCvCard();
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

	function appendEmoji(symbol: string) {
		composerValue = `${composerValue}${symbol}`;
		isEmojiPickerOpen = false;
		emojiSearch = '';
	}

	async function copyEmailToClipboard() {
		if (!browser || !navigator.clipboard) return;

		try {
			await navigator.clipboard.writeText(siteConfig.authorEmail);
			copiedEmail = true;

			if (copyResetTimer) {
				clearTimeout(copyResetTimer);
			}

			copyResetTimer = window.setTimeout(() => {
				copiedEmail = false;
			}, 1600);
		} catch {
			copiedEmail = false;
		}
	}

	async function submitLead(sourceSurface: 'chat' | 'mail_card') {
		const email = (sourceSurface === 'chat' ? chatEmail : mailCardEmail).trim();
		const currentState = sourceSurface === 'chat' ? chatLeadState : mailLeadState;

		if (!email) {
			if (sourceSurface === 'chat') {
				chatLeadState = {
					status: 'error',
					message: 'Add an email address first.'
				};
			} else {
				mailLeadState = {
					status: 'error',
					message: 'Add an email address first.'
				};
			}

			return;
		}

		if (currentState.status === 'submitting') return;

		if (sourceSurface === 'chat') {
			chatLeadState = { status: 'submitting', message: '' };
		} else {
			mailLeadState = { status: 'submitting', message: '' };
		}

		const payload: ContactLeadPayload = {
			email,
			message:
				sourceSurface === 'chat'
					? messages.find((message) => message.role === 'user')?.content
					: null,
			transcript: sourceSurface === 'chat' ? messages : [],
			sourcePath: page.url.pathname,
			sourceSurface
		};

		try {
			const response = await fetch('/api/contact-leads', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			const result = (await response.json()) as { success: boolean; error?: string };

			if (!response.ok || !result.success) {
				throw new Error(result.error ?? 'Request failed.');
			}

			if (sourceSurface === 'chat') {
				chatLeadState = {
					status: 'success',
					message: 'You will be notified here and by email.'
				};
			} else {
				mailLeadState = {
					status: 'success',
					message: 'Stored. I can follow up by email.'
				};
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : 'Could not store your email right now.';

			if (sourceSurface === 'chat') {
				chatLeadState = {
					status: 'error',
					message
				};
			} else {
				mailLeadState = {
					status: 'error',
					message
				};
			}
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
			<div
				role="dialog"
				aria-labelledby="contact-concierge-title"
				class={cn(
					'orbit-chat-panel pointer-events-auto absolute right-0 bottom-20 flex flex-col overflow-hidden rounded-[2rem] transition-[width,height,opacity,transform] duration-300 ease-out',
					isChatCollapsed
						? 'h-[min(calc(100vh-7.5rem),34rem)] w-[min(calc(100vw-1.5rem),24.5rem)] translate-y-0 opacity-100'
						: 'h-[min(calc(100vh-7.5rem),46rem)] w-[min(calc(100vw-1.5rem),43rem)] translate-y-0 opacity-100'
				)}
			>
				<header
					class={cn(
						'orbit-chat-header flex items-center justify-between gap-3',
						isChatCollapsed ? 'px-4 py-3.5' : 'px-5 py-4'
					)}
				>
					<div class="flex min-w-0 items-center gap-3">
						<div class="orbit-chat-avatar" aria-hidden="true">{assistantInitials}</div>
						<div class="min-w-0">
							<h2
								id="contact-concierge-title"
								class="truncate text-[0.98rem] font-semibold text-slate-900"
							>
								{siteConfig.contactWidget.assistantName}
							</h2>
							<p class="mt-0.5 truncate text-xs text-slate-500">Contact concierge</p>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<button
							type="button"
							onclick={() => {
								isChatCollapsed = !isChatCollapsed;
								isEmojiPickerOpen = false;
							}}
							class="orbit-chat-control inline-flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-[#1f5eff]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
							aria-label={isChatCollapsed
								? 'Expand concierge panel'
								: 'Make concierge panel smaller'}
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
								class={cn(
									'h-4 w-4 transition-transform duration-300',
									isChatCollapsed && 'rotate-180'
								)}
							>
								<path d="m15 18-6-6 6-6"></path>
							</svg>
						</button>
						<button
							type="button"
							onclick={closePanels}
							class="orbit-chat-control inline-flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-[#1f5eff]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
							aria-label="Close concierge"
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
						</button>
					</div>
				</header>

				<div class="flex min-h-0 flex-1 flex-col">
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
										'mx-auto max-w-[34ch] text-center text-[0.95rem] leading-7 text-slate-500',
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
								<p class="text-sm font-semibold text-slate-900">Get notified by email</p>
								<p class="mt-1 text-sm leading-6 text-slate-500">
									Leave the address once. I will keep the trail usable.
								</p>

								{#if chatLeadState.status === 'success'}
									<div class="orbit-chat-success mt-4 rounded-[1.3rem] p-4">
										<p class="text-sm font-medium text-slate-900">{chatLeadState.message}</p>
										<p class="mt-2 text-sm text-slate-500">{chatEmail}</p>
									</div>
								{:else}
									<form
										class="mt-4 flex flex-col gap-3 sm:flex-row"
										onsubmit={(event) => {
											event.preventDefault();
											void submitLead('chat');
										}}
									>
										<input
											bind:value={chatEmail}
											type="email"
											inputmode="email"
											autocomplete="email"
											placeholder="email@example.com"
											class="orbit-chat-email-input min-w-0 flex-1 rounded-full px-4 py-3 text-sm placeholder:text-slate-400 focus:border-[#1f5eff] focus:ring-2 focus:ring-[#1f5eff]/15"
										/>
										<button
											type="submit"
											class="orbit-chat-primary-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-[#1f5eff]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
											disabled={chatLeadState.status === 'submitting'}
										>
											{chatLeadState.status === 'submitting' ? 'Saving...' : 'Notify me'}
										</button>
									</form>

									{#if chatLeadState.status === 'error'}
										<p class="mt-3 text-sm text-rose-500">{chatLeadState.message}</p>
									{/if}
								{/if}
							</div>
						{/if}
					</div>

					<div
						class={cn(
							'border-t border-[#eef2f7] bg-white/92',
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
							<label class="sr-only" for="concierge-message">Message</label>
							<textarea
								id="concierge-message"
								bind:value={composerValue}
								rows="2"
								placeholder="Message..."
								class={cn(
									'orbit-chat-textarea w-full resize-none border-0 bg-transparent px-1 py-1 text-[0.95rem] leading-6 placeholder:text-slate-400 focus:ring-0',
									isChatCollapsed ? 'min-h-[4.75rem]' : 'min-h-[5.75rem]'
								)}
							></textarea>

							<div class="mt-2 flex items-center justify-between gap-3">
								<div class="relative flex items-center gap-2">
									<button
										type="button"
										onclick={() => {
											isEmojiPickerOpen = !isEmojiPickerOpen;
										}}
										class="orbit-chat-action-button inline-flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-[#1f5eff]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none"
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
									</button>

									{#if isEmojiPickerOpen}
										<div
											class={`orbit-emoji-popover absolute bottom-12 left-0 z-10 w-72 rounded-[1.4rem] ${emojiPopoverClass} p-3`}
										>
											<input
												bind:value={emojiSearch}
												type="search"
												placeholder="Search emoji..."
												class="orbit-emoji-search w-full rounded-full px-4 py-2 text-sm placeholder:text-slate-400 focus:border-[#1f5eff] focus:ring-2 focus:ring-[#1f5eff]/20"
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
																	<button
																		type="button"
																		onclick={() => appendEmoji(item.symbol)}
																		class="orbit-emoji-option inline-flex h-10 w-10 items-center justify-center rounded-full text-lg transition focus-visible:ring-2 focus-visible:ring-[#60a5fa]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] focus-visible:outline-none"
																		aria-label={item.name}
																	>
																		{item.symbol}
																	</button>
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

								<button
									type="submit"
									class="orbit-chat-send-button inline-flex h-11 w-11 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-[#1f5eff]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none disabled:cursor-not-allowed"
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
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		{/if}

		{#if activeSurface === 'mail'}
			<div
				role="dialog"
				aria-label="Direct mail"
				class={`pointer-events-auto absolute right-0 bottom-20 w-[min(calc(100vw-1.5rem),23rem)] overflow-hidden rounded-[2rem] ${floatingPanelClass} p-4 backdrop-blur-2xl sm:w-[22rem]`}
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-[0.65rem] font-semibold tracking-[0.24em] text-orange-500/80 uppercase">
							{siteConfig.contactWidget.directMailLabel}
						</p>
						<p class="mt-2 text-sm leading-7 text-muted-foreground">
							Open the mail app, copy the address, or leave your email and I can come back through
							the quieter route.
						</p>
					</div>

					<button
						type="button"
						onclick={closePanels}
						class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/55 text-muted-foreground transition hover:border-orange-500/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
						aria-label="Close direct mail card"
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
					</button>
				</div>

				<div class="mt-5 rounded-[1.6rem] border border-border/70 bg-background/55 p-4">
					<p class="text-sm font-medium text-foreground">{siteConfig.authorEmail}</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<a
							href={mailtoHref}
							class="inline-flex items-center gap-2 rounded-full border border-orange-500/28 bg-orange-500/12 px-4 py-2 text-sm font-medium text-foreground transition hover:border-orange-500/45 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
						>
							Open mail
						</a>
						<button
							type="button"
							onclick={copyEmailToClipboard}
							class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-4 py-2 text-sm font-medium text-foreground transition hover:border-orange-500/35 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
						>
							{copiedEmail ? 'Copied' : 'Copy email'}
						</button>
					</div>
				</div>

				<div class="mt-4 rounded-[1.6rem] border border-border/70 bg-background/55 p-4">
					<p class="text-sm font-semibold text-foreground">Get notified by email</p>
					<p class="mt-1 text-sm leading-6 text-muted-foreground">
						If direct mail is too early, leave the address once.
					</p>

					{#if mailLeadState.status === 'success'}
						<div class="mt-4 rounded-[1.2rem] border border-orange-500/24 bg-orange-500/10 p-4">
							<p class="text-sm font-medium text-foreground">{mailLeadState.message}</p>
							<p class="mt-2 text-sm text-muted-foreground">{mailCardEmail}</p>
						</div>
					{:else}
						<form
							class="mt-4 flex flex-col gap-3"
							onsubmit={(event) => {
								event.preventDefault();
								void submitLead('mail_card');
							}}
						>
							<input
								bind:value={mailCardEmail}
								type="email"
								inputmode="email"
								autocomplete="email"
								placeholder="email@example.com"
								class="rounded-full border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-500/45 focus:ring-2 focus:ring-orange-500/60"
							/>
							<button
								type="submit"
								class="inline-flex items-center justify-center gap-2 rounded-full border border-orange-500/28 bg-orange-500/12 px-4 py-3 text-sm font-medium text-foreground transition hover:border-orange-500/45 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
								disabled={mailLeadState.status === 'submitting'}
							>
								{mailLeadState.status === 'submitting' ? 'Saving...' : 'Notify me'}
							</button>
						</form>

						{#if mailLeadState.status === 'error'}
							<p class="mt-3 text-sm text-orange-400">{mailLeadState.message}</p>
						{/if}
					{/if}
				</div>
			</div>
		{/if}

		{#if activeSurface === 'cv'}
			<div
				role="dialog"
				aria-label="CV PDF"
				class={`pointer-events-auto absolute right-0 bottom-20 w-[min(calc(100vw-1.5rem),23rem)] overflow-hidden rounded-[2rem] ${floatingPanelClass} p-4 backdrop-blur-2xl sm:w-[22rem]`}
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-[0.65rem] font-semibold tracking-[0.24em] text-orange-500/80 uppercase">
							CV PDF
						</p>
						<p class="mt-2 text-sm leading-7 text-muted-foreground">
							The old CV page is gone. This orbit slot will become a direct downloadable PDF.
						</p>
					</div>

					<button
						type="button"
						onclick={closePanels}
						class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/55 text-muted-foreground transition hover:border-orange-500/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
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
					</button>
				</div>

				<div class="mt-5 rounded-[1.6rem] border border-border/70 bg-background/55 p-4">
					<p class="text-sm font-semibold text-foreground">Download coming soon</p>
					<p class="mt-1 text-sm leading-6 text-muted-foreground">
						Once the PDF is published, this action will download it directly instead of opening a
						separate page.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						<span
							class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
						>
							PDF soon
						</span>
						<a
							href={mailtoHref}
							class="inline-flex items-center gap-2 rounded-full border border-orange-500/28 bg-orange-500/12 px-4 py-2 text-sm font-medium text-foreground transition hover:border-orange-500/45 hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
						>
							Email me instead
						</a>
					</div>
				</div>
			</div>
		{/if}

		<div
			class="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rounded-full border border-black/8 [mask-image:radial-gradient(circle_at_bottom_right,transparent_34%,black_35%,black_67%,transparent_69%)] dark:border-white/8"
		></div>

		{#each orbitActions as action (action.id)}
			<button
				type="button"
				onclick={() => void handleOrbitAction(action.id)}
				class={cn(
					`pointer-events-auto absolute right-1 bottom-1 inline-flex origin-bottom-right items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-foreground ${orbitButtonClass} transition-[transform,opacity,border-color] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none`,
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
						action.id === 'chat' && 'text-orange-600 dark:text-orange-400',
						action.id === 'mail' && 'text-sky-600 dark:text-sky-300',
						action.id === 'cv' && 'text-emerald-600 dark:text-emerald-300'
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
					{:else if action.id === 'mail'}
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
							<rect x="3" y="5" width="18" height="14" rx="2"></rect>
							<path d="m3 7 9 6 9-6"></path>
						</svg>
					{:else}
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
					{/if}
				</span>
				<span class="pr-1">{action.label}</span>
			</button>
		{/each}

		<button
			type="button"
			onclick={handlePrimaryAction}
			class={`pointer-events-auto relative inline-flex h-16 w-16 items-center justify-center rounded-full text-foreground ${mainFabClass} transition hover:border-orange-500/35 hover:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none dark:hover:text-orange-400`}
			aria-label={isPrimaryFabActive ? 'Close contact controls' : 'Open contact controls'}
			aria-expanded={isOrbitOpen}
		>
			<span class="absolute inset-1 rounded-full border border-black/8 dark:border-white/8"></span>
			<span
				class="absolute h-9 w-9 rounded-full border border-orange-500/16 bg-orange-500/6 blur-sm"
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
		</button>
	</div>
</div>

<style>
	.orbit-surface {
		border: 1px solid hsl(var(--border) / 0.72);
	}

	.orbit-surface--panel {
		background:
			radial-gradient(circle at top, rgb(249 115 22 / 0.11), transparent 52%),
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

	.orbit-surface--popover {
		background: linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(245 247 251 / 0.98));
		box-shadow: 0 24px 70px rgb(148 163 184 / 0.22);
	}

	.orbit-chat-panel {
		border: 1px solid rgb(225 229 238 / 0.94);
		background:
			radial-gradient(circle at top right, rgb(31 94 255 / 0.06), transparent 30%),
			linear-gradient(180deg, rgb(255 255 255 / 0.99), rgb(249 250 252 / 0.98));
		box-shadow: 0 36px 120px rgb(15 23 42 / 0.2);
	}

	.orbit-chat-header {
		border-bottom: 1px solid rgb(234 237 243 / 0.95);
		background: linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(250 250 252 / 0.96));
	}

	.orbit-chat-avatar {
		display: inline-flex;
		height: 2.35rem;
		width: 2.35rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		background: linear-gradient(135deg, rgb(54 150 255), rgb(31 94 255));
		box-shadow: 0 10px 24px rgb(31 94 255 / 0.18);
		color: white;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.orbit-chat-control {
		border: 1px solid rgb(225 231 240);
		background: rgb(255 255 255 / 0.92);
		color: rgb(100 116 139);
		box-shadow: 0 8px 22px rgb(15 23 42 / 0.05);
	}

	.orbit-chat-control:hover {
		border-color: rgb(191 219 254);
		color: rgb(37 99 235);
	}

	.orbit-chat-transcript {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 0.38), rgb(255 255 255 / 0)),
			linear-gradient(180deg, rgb(255 255 255 / 0.98), rgb(252 252 253 / 0.96));
	}

	.orbit-chat-assistant-bubble {
		border: 1px solid rgb(235 239 244);
		background: rgb(245 247 250);
		box-shadow: 0 14px 34px rgb(15 23 42 / 0.05);
		color: rgb(17 24 39);
	}

	.orbit-chat-user-bubble {
		background: linear-gradient(180deg, rgb(31 94 255), rgb(22 78 247));
		box-shadow: 0 18px 40px rgb(31 94 255 / 0.24);
		color: white;
	}

	.orbit-chat-card {
		border: 1px solid rgb(228 233 241);
		background: rgb(255 255 255 / 0.98);
		box-shadow: 0 12px 34px rgb(15 23 42 / 0.04);
	}

	.orbit-chat-success {
		border: 1px solid rgb(213 225 255);
		background: linear-gradient(180deg, rgb(247 250 255), rgb(241 245 255));
	}

	.orbit-chat-email-input {
		border: 1px solid rgb(218 225 234);
		background: white;
		color: rgb(15 23 42);
	}

	.orbit-chat-primary-button {
		border: 1px solid rgb(198 214 255);
		background: rgb(240 244 255);
		color: rgb(29 78 216);
	}

	.orbit-chat-primary-button:hover {
		border-color: rgb(147 197 253);
		background: rgb(231 238 255);
	}

	.orbit-chat-composer {
		border: 2px solid rgb(36 99 235);
		background: white;
		box-shadow: 0 18px 46px rgb(59 130 246 / 0.08);
	}

	.orbit-chat-textarea {
		color: rgb(15 23 42);
	}

	.orbit-chat-action-button {
		border: 1px solid rgb(223 228 237);
		background: rgb(248 250 252);
		color: rgb(100 116 139);
	}

	.orbit-chat-action-button:hover {
		border-color: rgb(191 219 254);
		background: rgb(239 246 255);
		color: rgb(37 99 235);
	}

	.orbit-chat-send-button {
		background: linear-gradient(180deg, rgb(31 94 255), rgb(22 78 247));
		box-shadow: 0 18px 36px rgb(31 94 255 / 0.24);
		color: white;
	}

	.orbit-chat-send-button:hover:not(:disabled) {
		filter: brightness(1.04);
	}

	.orbit-chat-send-button:disabled {
		background: rgb(226 232 240);
		box-shadow: none;
		color: rgb(148 163 184);
	}

	.orbit-emoji-popover {
		border: 1px solid rgb(255 255 255 / 0.07);
		background:
			radial-gradient(circle at top left, rgb(96 165 250 / 0.14), transparent 28%),
			linear-gradient(180deg, rgb(17 24 39 / 0.98), rgb(10 15 27 / 0.98));
		box-shadow:
			0 24px 70px rgb(15 23 42 / 0.28),
			inset 0 1px 0 rgb(255 255 255 / 0.04);
		color: white;
	}

	.orbit-emoji-search {
		border: 1px solid rgb(226 232 240 / 0.9);
		background: linear-gradient(180deg, rgb(255 255 255), rgb(248 250 252));
		color: rgb(15 23 42);
		box-shadow: 0 10px 24px rgb(2 6 23 / 0.12);
	}

	.orbit-emoji-label {
		color: rgb(148 163 184);
	}

	.orbit-emoji-option {
		border: 1px solid rgb(226 232 240 / 0.9);
		background: linear-gradient(180deg, rgb(255 255 255), rgb(244 247 251));
		box-shadow: 0 10px 24px rgb(2 6 23 / 0.14);
	}

	.orbit-emoji-option:hover {
		border-color: rgb(147 197 253 / 0.7);
		background: linear-gradient(180deg, rgb(255 255 255), rgb(239 246 255));
		transform: translateY(-1px);
	}

	.orbit-emoji-empty {
		color: rgb(191 219 254);
	}

	:global(.dark) .orbit-surface {
		border-color: rgb(255 255 255 / 0.1);
	}

	:global(.dark) .orbit-surface--panel {
		background:
			radial-gradient(circle at top, rgb(249 115 22 / 0.12), transparent 52%),
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

	:global(.dark) .orbit-surface--popover {
		background: linear-gradient(180deg, rgb(14 16 28 / 0.98), rgb(6 8 14 / 0.98));
		box-shadow: 0 24px 70px rgb(0 0 0 / 0.45);
	}

	:global(.dark) .orbit-chat-panel,
	:global(.dark) .orbit-chat-header,
	:global(.dark) .orbit-chat-transcript,
	:global(.dark) .orbit-chat-card,
	:global(.dark) .orbit-chat-composer,
	:global(.dark) .orbit-chat-control,
	:global(.dark) .orbit-chat-action-button,
	:global(.dark) .orbit-chat-email-input,
	:global(.dark) .orbit-chat-primary-button,
	:global(.dark) .orbit-chat-success,
	:global(.dark) .orbit-chat-assistant-bubble {
		color-scheme: light;
	}

	:global(.dark) .orbit-emoji-popover {
		color-scheme: dark;
	}
</style>
