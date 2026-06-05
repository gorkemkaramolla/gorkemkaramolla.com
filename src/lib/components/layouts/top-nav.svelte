<script lang="ts">
	import { resolve } from '$app/paths';
	import { siteConfig } from '$lib/config/site-config';

	let navEl = $state<HTMLElement | null>(null);

	// Publish the live nav height so full-viewport sections (the hero) can size
	// themselves as `100svh - var(--nav-height)` across every breakpoint.
	$effect(() => {
		if (!navEl) return;
		const setHeight = () =>
			document.documentElement.style.setProperty('--nav-height', `${navEl!.offsetHeight}px`);
		setHeight();
		const observer = new ResizeObserver(setHeight);
		observer.observe(navEl);
		return () => observer.disconnect();
	});
</script>

<nav
	bind:this={navEl}
	class="sticky top-0 left-0 z-50 border-b border-border/60 bg-background/72 backdrop-blur-xl supports-backdrop-filter:bg-background/55"
>
	<div
		class="container mx-auto flex items-center justify-between gap-4 px-4 py-4 sm:gap-6 sm:px-6 lg:px-8"
	>
		<a
			href={resolve('/')}
			class="group inline-flex min-w-0 items-center gap-2 font-mono text-sm tracking-tight sm:text-base"
		>
			<span
				class="min-w-0 truncate font-semibold [text-shadow:0_0_6px_rgba(168,123,255,0.45)]"
			>
				<span class="text-[#a87bff]">gorkemkaramolla</span><span class="text-[#7b67b8]"
					>@Istanbul</span
				>
				<span class="text-[#7b67b8]">~</span>
				<span class="text-[#a87bff] transition-transform duration-200 group-hover:scale-125">$</span>
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

		</div>
	</div>
</nav>
