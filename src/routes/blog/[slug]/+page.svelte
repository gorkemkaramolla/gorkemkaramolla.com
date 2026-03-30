<script lang="ts">
	import { getActiveHeadingId, normalizeHashId, type HeadingPosition } from '$lib/blog/toc';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { post, htmlContent, readingMinutes, tableOfContents } = data;

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
	type MetaItem = {
		key: string;
		label: string;
		datetime?: string;
	};

	const metaItems: MetaItem[] = [
		publishedDate
			? {
					key: 'published',
					label: publishedDate,
					datetime: post.publishedAt ?? undefined
				}
			: null,
		readingMinutes > 0
			? {
					key: 'reading-time',
					label: `${readingMinutes} min read`
				}
			: null,
		post.author
			? {
					key: 'author',
					label: post.author
				}
			: null,
		updatedDate
			? {
					key: 'updated',
					label: `Updated ${updatedDate}`
				}
			: null
	].filter((item): item is MetaItem => item !== null);

	let articleBody: HTMLElement | null = null;
	let activeHeadingId = $state(tableOfContents[0]?.id ?? '');

	function collectHeadingPositions(): HeadingPosition[] {
		if (!articleBody) {
			return [];
		}

		const scrollTop = typeof window === 'undefined' ? 0 : window.scrollY;

		return Array.from(articleBody.querySelectorAll<HTMLElement>('h2[id], h3[id]')).map(
			(heading) => ({
				id: heading.id,
				top: heading.getBoundingClientRect().top + scrollTop
			})
		);
	}

	function syncActiveHeadingFromHash() {
		if (typeof window === 'undefined') {
			return;
		}

		const hashId = normalizeHashId(window.location.hash);
		if (hashId && tableOfContents.some((item) => item.id === hashId)) {
			activeHeadingId = hashId;
		}
	}

	function syncActiveHeading() {
		if (typeof window === 'undefined') {
			return;
		}

		const nextActiveId = getActiveHeadingId(
			collectHeadingPositions(),
			window.scrollY,
			window.innerHeight,
			document.documentElement.scrollHeight
		);

		if (nextActiveId) {
			activeHeadingId = nextActiveId;
		}
	}

	function setActiveHeading(id: string) {
		activeHeadingId = id;
	}

	onMount(() => {
		if (!tableOfContents.length) {
			return;
		}

		const handleScroll = () => syncActiveHeading();
		const handleHashChange = () => {
			syncActiveHeadingFromHash();
			requestAnimationFrame(syncActiveHeading);
		};
		const resizeObserver = articleBody ? new ResizeObserver(() => syncActiveHeading()) : null;

		requestAnimationFrame(() => {
			syncActiveHeadingFromHash();
			syncActiveHeading();
		});

		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll);
		window.addEventListener('hashchange', handleHashChange);
		if (articleBody) {
			resizeObserver?.observe(articleBody);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
			window.removeEventListener('hashchange', handleHashChange);
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
		href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<article class="blog-page">
	<header>
		<div class="blog-header-grid" class:blog-header-grid--with-media={!!post.featuredImageUrl}>
			<div>
				<div class="blog-meta">
					{#each metaItems as item, index (item.key)}
						{#if item.datetime}
							<time
								class="blog-meta__item"
								class:blog-meta__item--dot={index > 0}
								datetime={item.datetime}
							>
								{item.label}
							</time>
						{:else}
							<span class="blog-meta__item" class:blog-meta__item--dot={index > 0}>
								{item.label}
							</span>
						{/if}
					{/each}
				</div>

				<h1 class="blog-title">{post.title}</h1>

				{#if post.summary}
					<p class="blog-summary">{post.summary}</p>
				{/if}

				{#if post.tags && post.tags.length > 0}
					<ul class="blog-tag-list" aria-label="Topics">
						{#each post.tags as tag}
							<li class="blog-tag">{tag}</li>
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
					<ol class="blog-toc__list">
						{#each tableOfContents as item}
							<li>
								<a
									href={`#${item.id}`}
									class="blog-toc__link"
									class:blog-toc__link--nested={item.level === 3}
									class:blog-toc__link--active={activeHeadingId === item.id}
									aria-current={activeHeadingId === item.id ? 'location' : undefined}
									onclick={() => setActiveHeading(item.id)}
								>
									{item.text}
								</a>
							</li>
						{/each}
					</ol>
				</nav>
			{/if}

			<div class="blog-prose" bind:this={articleBody}>
				{#if htmlContent}
					{@html htmlContent}
				{:else}
					<p class="blog-empty">No content available yet.</p>
				{/if}
			</div>
		</div>

		{#if tableOfContents.length > 0}
			<aside class="blog-sidebar">
				<nav class="blog-toc" aria-labelledby="blog-toc-desktop-title">
					<p id="blog-toc-desktop-title" class="blog-toc__title">On this page</p>
					<ol class="blog-toc__list">
						{#each tableOfContents as item}
							<li>
								<a
									href={`#${item.id}`}
									class="blog-toc__link"
									class:blog-toc__link--nested={item.level === 3}
									class:blog-toc__link--active={activeHeadingId === item.id}
									aria-current={activeHeadingId === item.id ? 'location' : undefined}
									onclick={() => setActiveHeading(item.id)}
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
