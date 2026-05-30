<script lang="ts">
	import { siteConfig } from '$lib/config/site-config';
	import { landingContent } from '$lib/config/landing-content';

	const { contact } = landingContent;
	const mailtoHref = `mailto:${siteConfig.authorEmail}`;

	const socials = [
		{ label: 'GitHub', href: siteConfig.authorGithub },
		{ label: 'LinkedIn', href: siteConfig.authorLinkedin },
		{ label: 'Stack Overflow', href: siteConfig.authorStackoverflow }
	];
</script>

<section id="contact" aria-labelledby="contact-title" class="scroll-mt-24">
	<div
		class="relative isolate overflow-hidden rounded-[1.8rem] border border-border/70 px-6 py-12 text-center sm:px-10 sm:py-16"
	>
		<!-- Brand-tinted backdrop + grain for a noir finish -->
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-brand)_18%,transparent),transparent_55%)] bg-background/60"
		></div>
		<div aria-hidden="true" class="grain-overlay -z-10 opacity-20"></div>

		<p class="text-[0.72rem] font-semibold tracking-[0.3em] text-brand/85 uppercase">
			{contact.eyebrow}
		</p>
		<h2
			id="contact-title"
			class="mx-auto mt-3 max-w-[20ch] text-3xl font-semibold tracking-[-0.05em] text-balance text-foreground sm:text-4xl"
		>
			{contact.title}
		</h2>
		<p class="mx-auto mt-4 max-w-xl text-base leading-7 text-pretty text-muted-foreground">
			{contact.description}
		</p>

		<div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
			<a
				href={mailtoHref}
				class="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px] shadow-brand/60 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4"
					aria-hidden="true"
				>
					<rect x="3" y="5" width="18" height="14" rx="2"></rect>
					<path d="m3 7 9 6 9-6"></path>
				</svg>
				{siteConfig.authorEmail}
			</a>
		</div>

		<div class="mt-6 flex flex-wrap items-center justify-center gap-2">
			{#each socials as social (social.label)}
				<a
					href={social.href}
					target="_blank"
					rel="noreferrer noopener"
					class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-xl transition hover:border-brand/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					{social.label}
				</a>
			{/each}
		</div>
	</div>
</section>
