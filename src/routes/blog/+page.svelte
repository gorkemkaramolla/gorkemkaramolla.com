<script lang="ts">
	import BlogPanelCard from '$lib/components/ui/blog-panel-card.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { siteConfig } from '$lib/config/site-config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Blog | {siteConfig.name}</title>
	<meta
		name="description"
		content="A temporary archive of published notes on software, interfaces, and deliberate systems."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-[86rem] flex-col gap-10 pt-4 pb-16 md:gap-14">
	<section class="grid gap-6">
		<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<h2 class="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
					Every published post under `/blog`.
				</h2>
			</div>
		</div>

		{#if data.posts.length > 0}
			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{#each data.posts as post, index (post.slug)}
					<BlogPanelCard {post} {index} />
				{/each}
			</div>
		{:else}
			<Card
				className="rounded-[1.5rem] border-border/70 bg-background/45 p-8 text-muted-foreground backdrop-blur-xl"
			>
				No published posts are available yet.
			</Card>
		{/if}
	</section>
</div>

<style>
	:global(.blog-index-shell) {
		background:
			radial-gradient(circle at top right, rgb(249 115 22 / 0.14), transparent 42%),
			linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(244 246 251 / 0.96));
		box-shadow: 0 24px 80px rgb(148 163 184 / 0.2);
	}

	:global(.dark) :global(.blog-index-shell) {
		border-color: rgb(255 255 255 / 0.1);
		background:
			radial-gradient(circle at top right, rgb(249 115 22 / 0.12), transparent 42%),
			linear-gradient(180deg, rgb(10 12 20 / 0.84), rgb(4 5 10 / 0.94));
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.28);
	}
</style>
