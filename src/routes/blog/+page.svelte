<script lang="ts">
	import { resolve } from '$app/paths';
	import BlogPanelCard from '$lib/components/ui/blog-panel-card.svelte';
	import { siteConfig } from '$lib/config/site-config';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});

	const featuredCount = data.posts.filter((post) => post.isFeatured).length;
	const latestPublishedAt = data.posts.reduce<string | null>((latest, post) => {
		if (!post.publishedAt) {
			return latest;
		}

		if (!latest) {
			return post.publishedAt;
		}

		return new Date(post.publishedAt).getTime() > new Date(latest).getTime()
			? post.publishedAt
			: latest;
	}, null);
	const latestPublishedLabel = latestPublishedAt
		? dateFormatter.format(new Date(latestPublishedAt))
		: 'No publication date yet';
</script>

<svelte:head>
	<title>Blog | {siteConfig.name}</title>
	<meta
		name="description"
		content="A temporary archive of published notes on software, interfaces, and deliberate systems."
	/>
</svelte:head>

<div class="mx-auto flex w-full max-w-[86rem] flex-col gap-10 pt-4 pb-16 md:gap-14">
	<section
		class="grid gap-8 border-b border-border/60 pb-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.85fr)] lg:items-start"
	>
		<div class="space-y-6 lg:pt-4">
			<p class="text-[0.72rem] font-semibold tracking-[0.3em] text-orange-500/85 uppercase">
				Blog
			</p>
			<h1
				class="max-w-[12ch] text-4xl font-semibold tracking-[-0.07em] text-foreground sm:text-5xl lg:text-[4.5rem] lg:leading-[0.92]"
			>
				Published notes, assembled in one place.
			</h1>
			<p class="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
				Posts on software engineering, interfaces, and shipping—synced from the same source as the
				home page highlights. Everything listed here is what is currently live.
			</p>
			<a
				href={resolve('/')}
				class="inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
			>
				Back to home
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
					<path d="M5 12h14"></path>
					<path d="m13 5 7 7-7 7"></path>
				</svg>
			</a>
		</div>

		<aside
			class="blog-index-shell overflow-hidden rounded-[2rem] border border-border/70 p-6 backdrop-blur-xl lg:p-7"
		>
			<div class="flex items-center justify-between gap-4">
				<p class="text-[0.68rem] font-semibold tracking-[0.24em] text-orange-500/78 uppercase">
					Archive status
				</p>
				<span
					class="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/45 px-3 py-1 text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase"
				>
					<span aria-hidden="true" class="h-1.5 w-1.5 rounded-full bg-orange-500/80"></span>
					Live content
				</span>
			</div>

			<div class="mt-6 space-y-0">
				<div class="border-t border-border/60 py-4 first:border-t-0 first:pt-0">
					<p class="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
						Published
					</p>
					<p class="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
						{data.posts.length}
					</p>
				</div>

				<div class="border-t border-border/60 py-4">
					<p class="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
						Featured
					</p>
					<p class="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
						{featuredCount}
					</p>
				</div>

				<div class="border-t border-border/60 pt-4">
					<p class="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
						Latest note
					</p>
					<p class="mt-3 text-sm leading-7 text-muted-foreground">
						{latestPublishedLabel}
					</p>
				</div>
			</div>
		</aside>
	</section>

	<section class="grid gap-6">
		<div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<p class="text-[0.72rem] font-semibold tracking-[0.24em] text-orange-500/85 uppercase">
					All notes
				</p>
				<h2 class="text-3xl font-semibold tracking-[-0.05em] text-foreground sm:text-4xl">
					Every published post under `/blog`.
				</h2>
			</div>
			<p class="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
				The card layout is shared with the homepage so this index stays aligned with the current
				visual system while the fuller archive page is still in progress.
			</p>
		</div>

		{#if data.posts.length > 0}
			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{#each data.posts as post, index (post.slug)}
					<BlogPanelCard {post} {index} />
				{/each}
			</div>
		{:else}
			<div
				class="rounded-[1.5rem] border border-border/70 bg-background/45 p-8 text-muted-foreground backdrop-blur-xl"
			>
				No published posts are available yet.
			</div>
		{/if}
	</section>
</div>

<style>
	.blog-index-shell {
		background:
			radial-gradient(circle at top right, rgb(249 115 22 / 0.14), transparent 42%),
			linear-gradient(180deg, rgb(255 255 255 / 0.9), rgb(244 246 251 / 0.96));
		box-shadow: 0 24px 80px rgb(148 163 184 / 0.2);
	}

	:global(.dark) .blog-index-shell {
		border-color: rgb(255 255 255 / 0.1);
		background:
			radial-gradient(circle at top right, rgb(249 115 22 / 0.12), transparent 42%),
			linear-gradient(180deg, rgb(10 12 20 / 0.84), rgb(4 5 10 / 0.94));
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.28);
	}
</style>
