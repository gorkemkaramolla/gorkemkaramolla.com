<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { post, htmlContent, readingMinutes, tableOfContents } = data;

	const eyebrow = post.tags?.[0] ?? 'Article';
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	const publishedDate = post.publishedAt ? dateFormatter.format(new Date(post.publishedAt)) : null;
	const updatedDate =
		post.updatedAt && post.updatedAt !== post.publishedAt
			? dateFormatter.format(new Date(post.updatedAt))
			: null;

	let articleBody: HTMLElement | null = null;
	let readingProgress = $state(0);

	function clamp(value: number, min: number, max: number) {
		return Math.min(Math.max(value, min), max);
	}

	function updateReadingProgress() {
		if (!articleBody || typeof window === 'undefined') {
			readingProgress = 0;
			return;
		}

		const rect = articleBody.getBoundingClientRect();
		const start = window.scrollY + rect.top - 160;
		const end = start + rect.height - window.innerHeight * 0.45;
		const nextProgress =
			end <= start ? 1 : (window.scrollY - start) / Math.max(end - start, window.innerHeight);

		readingProgress = clamp(nextProgress, 0, 1);
	}

	onMount(() => {
		updateReadingProgress();

		const handleUpdate = () => updateReadingProgress();
		const resizeObserver = articleBody ? new ResizeObserver(handleUpdate) : null;

		window.addEventListener('scroll', handleUpdate, { passive: true });
		window.addEventListener('resize', handleUpdate);
		if (articleBody) {
			resizeObserver?.observe(articleBody);
		}

		return () => {
			window.removeEventListener('scroll', handleUpdate);
			window.removeEventListener('resize', handleUpdate);
			resizeObserver?.disconnect();
		};
	});
</script>

<svelte:head>
	<title>{post.metaTitle ?? post.title}</title>
	<meta property="og:type" content="article" />
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
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="blog-progress" aria-hidden="true">
	<span style={`transform: scaleX(${readingProgress})`}></span>
</div>

<article class="blog-shell">
	<header class="blog-hero">
		<div class="blog-hero__inner" class:blog-hero__inner--with-media={!!post.featuredImageUrl}>
			<div class="blog-hero__copy">
				<div class="blog-eyebrow blog-ui">{eyebrow}</div>
				<h1 class="blog-title">{post.title}</h1>

				<div class="blog-meta blog-ui">
					{#if post.author}
						<span>By {post.author}</span>
					{/if}
					{#if publishedDate}
						<time datetime={post.publishedAt ?? undefined}>{publishedDate}</time>
					{/if}
					{#if readingMinutes > 0}
						<span>{readingMinutes} min read</span>
					{/if}
					{#if updatedDate}
						<span>Updated {updatedDate}</span>
					{/if}
				</div>

				{#if post.summary}
					<p class="blog-deck">{post.summary}</p>
				{/if}

				{#if post.tags && post.tags.length > 0}
					<ul class="blog-tags blog-ui" aria-label="Topics">
						{#each post.tags as tag}
							<li>{tag}</li>
						{/each}
					</ul>
				{/if}
			</div>

			{#if post.featuredImageUrl}
				<figure class="blog-featured-media">
					<img src={post.featuredImageUrl} alt={post.featuredImageAlt ?? post.title ?? ''} />
				</figure>
			{/if}
		</div>
	</header>

	<div class="blog-layout" class:blog-layout--with-sidebar={tableOfContents.length > 0}>
		<div class="blog-main">
			{#if tableOfContents.length > 0}
				<nav class="blog-toc blog-toc--mobile" aria-labelledby="blog-toc-mobile-title">
					<p id="blog-toc-mobile-title" class="blog-toc__title">On this page</p>
					<ol>
						{#each tableOfContents as item}
							<li>
								<a
									href={`#${item.id}`}
									class="blog-toc__link"
									class:blog-toc__link--nested={item.level === 3}
								>
									{item.text}
								</a>
							</li>
						{/each}
					</ol>
				</nav>
			{/if}

			<div class="blog-content" bind:this={articleBody}>
				{#if htmlContent}
					{@html htmlContent}
				{:else}
					<p class="blog-empty">No content available yet.</p>
				{/if}
			</div>
		</div>

		{#if tableOfContents.length > 0}
			<aside class="blog-sidebar">
				<nav class="blog-toc blog-toc--desktop" aria-labelledby="blog-toc-desktop-title">
					<p id="blog-toc-desktop-title" class="blog-toc__title">On this page</p>
					<ol>
						{#each tableOfContents as item}
							<li>
								<a
									href={`#${item.id}`}
									class="blog-toc__link"
									class:blog-toc__link--nested={item.level === 3}
								>
									{item.text}
								</a>
							</li>
						{/each}
					</ol>
				</nav>
			</aside>
		{/if}
	</div>
</article>
