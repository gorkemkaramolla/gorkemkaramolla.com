<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '$lib/config/site-config';
	import ThemeToggle from '$lib/components/layouts/theme-toggle.svelte';
</script>

<nav
	class="sticky top-0 left-0 z-50 border-b border-border/60 bg-background/72 backdrop-blur-xl supports-backdrop-filter:bg-background/55"
>
	<div
		class="container mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6 lg:px-8"
	>
		<a
			href={resolve('/')}
			class="group inline-flex min-w-0 items-center gap-2 font-mono text-sm tracking-tight sm:text-base"
		>
			<span class="min-w-0 truncate font-semibold">
				<span class="text-brand">gorkemkaramolla</span><span class="text-muted-foreground"
					>@Istanbul</span
				>
				<span class="text-muted-foreground">~</span>
				<span class="text-brand transition-transform duration-200 group-hover:scale-125">$</span>
			</span>
		</a>

		<div class="flex shrink-0 items-center gap-2 sm:gap-3">
			{#each siteConfig.navLinks as link (link.label)}
				<a
					href={resolve(link.href)}
					class="rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase transition hover:border-brand/35 hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
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
