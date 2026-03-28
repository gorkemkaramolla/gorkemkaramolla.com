<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { post, htmlContent } = data;
</script>

<svelte:head>
	<title>{post.metaTitle ?? post.title}</title>
	{#if post.metaDescription ?? post.summary}
		<meta name="description" content={post.metaDescription ?? post.summary ?? ''} />
	{/if}
	{#if post.noIndex}
		<meta name="robots" content="noindex" />
	{/if}
	{#if post.canonicalUrl}
		<link rel="canonical" href={post.canonicalUrl} />
	{/if}
	{#if post.ogTitle}
		<meta property="og:title" content={post.ogTitle} />
	{/if}
	{#if post.ogDescription}
		<meta property="og:description" content={post.ogDescription} />
	{/if}
	{#if post.ogImage}
		<meta property="og:image" content={post.ogImage} />
	{/if}
</svelte:head>

<article class="prose prose-invert max-w-none">
	<header class="mb-8 not-prose">
		{#if post.featuredImageUrl}
			<img
				src={post.featuredImageUrl}
				alt={post.featuredImageAlt ?? post.title ?? ''}
				class="mb-6 w-full rounded-lg object-cover"
			/>
		{/if}

		<h1 class="text-4xl font-bold text-foreground">{post.title}</h1>

		<div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
			{#if post.author}
				<span>{post.author}</span>
			{/if}
			{#if post.publishedAt}
				<time datetime={post.publishedAt}>
					{new Date(post.publishedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</time>
			{/if}
		</div>

		{#if post.tags && post.tags.length > 0}
			<div class="mt-3 flex flex-wrap gap-2">
				{#each post.tags as tag}
					<span class="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
						{tag}
					</span>
				{/each}
			</div>
		{/if}

		{#if post.summary}
			<p class="mt-4 text-lg text-muted-foreground">{post.summary}</p>
		{/if}
	</header>

	{#if htmlContent}
		{@html htmlContent}
	{:else}
		<p>No content available.</p>
	{/if}
</article>
