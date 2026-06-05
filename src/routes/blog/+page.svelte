<script lang="ts">
	import BlogListRow from '$lib/components/ui/blog-list-row.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import { siteConfig } from '$lib/config/site-config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const postCount = data.posts.length;
</script>

<svelte:head>
	<title>Blog | {siteConfig.name}</title>
	<meta
		name="description"
		content="Notes on software, interfaces, and deliberate systems — written while building."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-10 pt-6 pb-20 md:gap-12">
	<header class="space-y-4">
		<p class="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-brand uppercase">
			<span aria-hidden="true">$</span>
			ls ~/blog
		</p>
		<h1 class="text-3xl font-semibold tracking-[-0.05em] text-balance text-foreground sm:text-4xl">
			Blog
		</h1>
		<p class="max-w-2xl text-base leading-7 text-pretty text-muted-foreground">
			Notes on software, interfaces, and the craft of shipping — written as I build.
		</p>
		{#if postCount > 0}
			<p class="font-mono text-xs text-muted-foreground/70">
				{postCount}
				{postCount === 1 ? 'post' : 'posts'}
			</p>
		{/if}
	</header>

	{#if postCount > 0}
		<section
			class="flex flex-col [&>*:last-child]:border-b [&>*:last-child]:border-border/40"
			aria-label="All posts"
		>
			{#each data.posts as post, index (post.slug)}
				<BlogListRow {post} {index} />
			{/each}
		</section>
	{:else}
		<Card
			className="rounded-2xl border-dashed border-border/70 bg-background/40 p-10 text-center font-mono text-sm text-muted-foreground backdrop-blur-xl"
		>
			<span class="text-brand">$</span> No posts published yet — check back soon.
		</Card>
	{/if}
</div>
