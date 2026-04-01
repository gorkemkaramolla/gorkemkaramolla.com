<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '$lib/config/site-config';

	const currentYear = new Date().getFullYear();
	const focusRingClass =
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
	const chipClass = `inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition hover:border-orange-500/35 hover:text-foreground ${focusRingClass}`;
	const mailtoHref = `mailto:${siteConfig.authorEmail}`;
</script>

<footer class="border-t border-border/60 bg-background/42 print:hidden">
	<div
		class="container mx-auto flex flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between"
	>
		<div class="space-y-1">
			<p
				class="inline-flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
			>
				<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-orange-500/80"></span>
				Field notes by {siteConfig.author}
			</p>
			<p class="text-sm text-muted-foreground">
				Reach out at
				<a
					href={mailtoHref}
					class={`text-foreground transition hover:text-orange-500 ${focusRingClass}`}
				>
					{siteConfig.authorEmail}
				</a>
			</p>
		</div>

		<div class="flex flex-wrap items-center gap-2 md:justify-end">
			{#each siteConfig.footerNav as link (link.label)}
				<a href={resolve(link.href)} class={chipClass}>
					{link.label}
				</a>
			{/each}

			{#each siteConfig.footerSocials as link (link.label)}
				<a
					href={`https://${link.href.replace(/^https?:\/\//, '')}`}
					target="_blank"
					rel="noreferrer noopener"
					class={chipClass}
				>
					{link.label}
				</a>
			{/each}

			<span
				class="ml-1 text-[0.68rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
			>
				© {currentYear}
			</span>
		</div>
	</div>
</footer>
