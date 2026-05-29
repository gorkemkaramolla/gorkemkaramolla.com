<script lang="ts">
	import BlogPanelCard from '$lib/components/ui/blog-panel-card.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { siteConfig } from '$lib/config/site-config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{siteConfig.name} — Software engineer</title>
	<meta
		name="description"
		content="Software engineer in Istanbul: work history, education, selected projects, and technical writing on software and interfaces."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-344 flex-col gap-12 pt-4 pb-16 md:gap-16">
	<section id="writing" class="grid gap-6 border-t border-border/60 pt-8">
		<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<p class="text-[0.72rem] font-semibold tracking-[0.24em] text-orange-500/85 uppercase">
					Latest writing
				</p>
				<h2 class="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
					Technical writing, not a social feed.
				</h2>
			</div>
		</div>

		{#if data.featuredPosts.length > 0}
			<div class="grid gap-4 xl:grid-cols-3">
				{#each data.featuredPosts as post, index (post.slug)}
					<BlogPanelCard {post} {index} />
				{/each}
			</div>
		{:else}
			<Card
				className="border-border/70 bg-background/45 p-6 text-muted-foreground backdrop-blur-xl"
			>
				New posts will show here when they are published.
			</Card>
		{/if}
	</section>
</div>

<style>
</style>
