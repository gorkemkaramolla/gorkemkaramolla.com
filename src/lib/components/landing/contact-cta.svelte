<script lang="ts">
	import { siteConfig } from '$lib/config/site-config';
	import { landingContent } from '$lib/config/landing-content';

	const { contact } = landingContent;

	type ContactLink = {
		label: string;
		href: string;
		hint: string;
		icon: 'mail' | 'linkedin' | 'github' | 'stackoverflow';
		external: boolean;
	};

	const links: ContactLink[] = [
		{
			label: 'Email',
			href: `mailto:${siteConfig.authorEmail}`,
			hint: siteConfig.authorEmail,
			icon: 'mail',
			external: false
		},
		{
			label: 'LinkedIn',
			href: siteConfig.authorLinkedin,
			hint: '/in/gorkemkaramolla',
			icon: 'linkedin',
			external: true
		},
		{
			label: 'GitHub',
			href: siteConfig.authorGithub,
			hint: '@gorkemkaramolla',
			icon: 'github',
			external: true
		},
		{
			label: 'Stack Overflow',
			href: siteConfig.authorStackoverflow,
			hint: 'Q&A profile',
			icon: 'stackoverflow',
			external: true
		}
	];
</script>

<section id="contact" aria-labelledby="contact-title" class="scroll-mt-24">
	<div class="grid gap-x-16 gap-y-12 lg:grid-cols-2 lg:items-center">
		<!-- Left: pitch + facts -->
		<div>
			<p class="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-brand/85 uppercase">
				<span aria-hidden="true" class="h-px w-7 bg-brand/60"></span>
				{contact.eyebrow}
			</p>

			<h2
				id="contact-title"
				class="mt-6 max-w-[11ch] text-4xl font-semibold tracking-[-0.05em] text-balance text-foreground sm:text-5xl lg:text-6xl"
			>
				{contact.title}
			</h2>

			<p class="mt-5 max-w-md text-base leading-7 text-pretty text-muted-foreground">
				{contact.description}
			</p>

			<dl class="mt-10 grid max-w-md grid-cols-2 gap-x-8 gap-y-6">
				{#each contact.meta as fact (fact.label)}
					<div>
						<dt
							class="font-mono text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground/70 uppercase"
						>
							{fact.label}
						</dt>
						<dd class="mt-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
							{#if fact.label.toLowerCase() === 'status'}
								<span class="relative flex h-2 w-2" aria-hidden="true">
									<span
										class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:hidden"
									></span>
									<span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
								</span>
							{/if}
							{fact.value}
						</dd>
					</div>
				{/each}
			</dl>
		</div>

		<!-- Right: large contact links -->
		<ul class="flex flex-col">
			{#each links as link (link.label)}
				<li>
					<a
						href={link.href}
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noreferrer noopener' : undefined}
						class="link-row group focus-visible:outline-none"
						aria-label={`${link.label} — ${link.hint}`}
					>
						<span aria-hidden="true" class="accent"></span>

						<span class="link-icon" aria-hidden="true">
							{#if link.icon === 'mail'}
								<svg
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.7"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<rect x="3" y="5" width="18" height="14" rx="2"></rect>
									<path d="m3 7 9 6 9-6"></path>
								</svg>
							{:else if link.icon === 'linkedin'}
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"
									></path>
								</svg>
							{:else if link.icon === 'github'}
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.44-2.71 5.42-5.28 5.7.41.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.68.8.56A11.53 11.53 0 0 0 23.5 12.02C23.5 5.74 18.27.5 12 .5Z"
									></path>
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path
										d="M17.36 20.2v-5.38h1.79V22H3v-7.18h1.8v5.38h12.56ZM6.77 14.32l.37-1.76 8.79 1.85-.37 1.76-8.79-1.85Zm1.16-4.21.76-1.61 8.14 3.79-.76 1.62-8.14-3.8Zm2.26-3.99 1.15-1.38 6.9 5.76-1.15 1.37-6.9-5.75ZM14.65 2l5.35 7.22-1.45 1.07-5.35-7.22L14.65 2ZM6.59 18.41v-1.8h8.95v1.8H6.59Z"
									></path>
								</svg>
							{/if}
						</span>

						<span class="link-main">
							<span class="link-label">{link.label}</span>
							<span class="link-hint">{link.hint}</span>
						</span>

						<span class="link-arrow" aria-hidden="true">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M5 12h14"></path>
								<path d="m13 5 7 7-7 7"></path>
							</svg>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.link-row {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1.1rem;
		padding: 1.5rem 0.5rem 1.5rem 1rem;
		border-top: 1px solid color-mix(in srgb, var(--color-border) 65%, transparent);
		color: var(--color-foreground);
		isolation: isolate;
	}

	/* close the list with a bottom hairline */
	li:last-child .link-row {
		border-bottom: 1px solid color-mix(in srgb, var(--color-border) 65%, transparent);
	}

	/* Brand wipe that grows from the left on hover. */
	.accent {
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--color-brand) 9%, transparent);
		opacity: 0;
		transform: scaleX(0.6);
		transform-origin: left center;
		transition:
			opacity 0.35s ease,
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.link-row:hover .accent,
	.link-row:focus-visible .accent {
		opacity: 1;
		transform: scaleX(1);
	}

	.link-icon {
		display: grid;
		height: 2rem;
		width: 2rem;
		flex-shrink: 0;
		place-items: center;
		color: var(--color-muted-foreground);
		opacity: 0.75;
		transition:
			color 0.3s ease,
			opacity 0.3s ease,
			transform 0.3s ease;
	}
	.link-icon :global(svg) {
		height: 1.7rem;
		width: 1.7rem;
	}

	@media (min-width: 640px) {
		.link-icon {
			height: 2.25rem;
			width: 2.25rem;
		}
		.link-icon :global(svg) {
			height: 1.9rem;
			width: 1.9rem;
		}
	}

	.link-row:hover .link-icon,
	.link-row:focus-visible .link-icon {
		color: var(--color-brand);
		opacity: 1;
		transform: scale(1.05);
	}

	.link-main {
		display: flex;
		min-width: 0;
		flex: 1;
		flex-direction: column;
		gap: 0.1rem;
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.link-row:hover .link-main,
	.link-row:focus-visible .link-main {
		transform: translateX(0.4rem);
	}

	.link-label {
		font-size: 1.6rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--color-foreground);
		transition: color 0.3s ease;
	}

	@media (min-width: 640px) {
		.link-label {
			font-size: 1.9rem;
		}
	}

	.link-row:hover .link-label,
	.link-row:focus-visible .link-label {
		color: var(--color-brand);
	}

	.link-hint {
		overflow: hidden;
		font-size: 0.78rem;
		letter-spacing: 0.01em;
		color: var(--color-muted-foreground);
		opacity: 0.65;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.link-arrow {
		display: grid;
		height: 2.6rem;
		width: 2.6rem;
		flex-shrink: 0;
		place-items: center;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--color-border) 80%, transparent);
		color: var(--color-muted-foreground);
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease,
			color 0.3s ease,
			transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.link-arrow :global(svg) {
		height: 1.05rem;
		width: 1.05rem;
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.link-row:hover .link-arrow,
	.link-row:focus-visible .link-arrow {
		border-color: var(--color-brand);
		background: var(--color-brand);
		color: #0c0a16;
		transform: rotate(-45deg);
	}

	.link-row:hover .link-arrow :global(svg),
	.link-row:focus-visible .link-arrow :global(svg) {
		transform: translateX(1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.accent,
		.link-icon,
		.link-main,
		.link-label,
		.link-arrow,
		.link-arrow :global(svg) {
			transition: none;
		}
		.link-row:hover .link-arrow,
		.link-row:focus-visible .link-arrow {
			transform: none;
		}
	}
</style>
