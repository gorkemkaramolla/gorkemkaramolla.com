<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '$lib/config/site-config';
	import ThemeToggle from '$lib/components/layouts/theme-toggle.svelte';
</script>

<nav
	class="sticky top-0 left-0 z-50 border-b border-border/60 bg-background/72 backdrop-blur-xl supports-backdrop-filter:bg-background/55"
>
	<div class="container mx-auto flex items-center justify-between gap-6 px-6 py-4">
		<a href={resolve('/')} class="group inline-flex items-center gap-3">
			<span
				aria-hidden="true"
				class="h-2 w-2 rounded-full bg-orange-500/85 transition-transform duration-200 group-hover:scale-125"
			></span>
			<span class="text-lg font-semibold tracking-[-0.05em] text-foreground sm:text-xl">
				{siteConfig.brandLabel}
			</span>
		</a>

		<div class="flex items-center gap-2 sm:gap-3">
			{#each siteConfig.navLinks as link (link.label)}
				<a
					href={resolve(link.href)}
					class="rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase transition hover:border-orange-500/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
				>
					{link.label}
				</a>
			{/each}

			<div class="rounded-full border border-border/70 bg-background/55">
				<ThemeToggle />
			</div>
		</div>
	</div>
</nav>
