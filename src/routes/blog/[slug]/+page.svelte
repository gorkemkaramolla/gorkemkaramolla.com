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

	const articleClass = [
		'relative',
		'mx-auto',
		'max-w-[1120px]',
		'pb-16',
		'pt-5',
		'text-foreground',
		"[font-family:'IBM_Plex_Sans',ui-sans-serif,sans-serif]"
	].join(' ');

	const heroInnerClass = [
		'grid',
		'gap-5',
		'border-b',
		'border-border',
		'pb-6',
		post.featuredImageUrl
			? 'min-[72rem]:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)] min-[72rem]:items-start'
			: ''
	].join(' ');

	const layoutClass = [
		'mt-8',
		tableOfContents.length > 0
			? 'min-[72rem]:grid min-[72rem]:grid-cols-[minmax(0,68ch)_minmax(15rem,17rem)] min-[72rem]:items-start min-[72rem]:justify-between min-[72rem]:gap-12'
			: ''
	].join(' ');

	const tocCardClass = [
		'rounded-2xl',
		'border',
		'border-border',
		'bg-background',
		'p-4',
		'pb-[1.05rem]'
	].join(' ');

	const tocTitleClass =
		'm-0 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground';
	const tocListClass = 'mt-4 grid list-none gap-[0.55rem] p-0';

	const articleContentClass = [
		'max-w-[68ch]',
		'text-[clamp(1.02rem,0.96rem+0.28vw,1.12rem)]',
		'leading-[1.82]',
		'text-foreground',
		'max-[48rem]:text-base',
		'max-[48rem]:leading-[1.76]',
		'[&>*]:m-0',
		'[&>*+*]:mt-[1.5em]',
		'[&_p]:text-pretty',
		'[&_h2]:mt-[2.3em]',
		'[&_h2]:scroll-mt-18',
		'[&_h2]:text-balance',
		'[&_h2]:text-[clamp(1.7rem,1.25rem+1vw,2.2rem)]',
		'[&_h2]:font-semibold',
		'[&_h2]:leading-[1.16]',
		'[&_h2]:tracking-[-0.02em]',
		'[&_h3]:mt-[2.3em]',
		'[&_h3]:scroll-mt-18',
		'[&_h3]:text-balance',
		'[&_h3]:text-[clamp(1.35rem,1.15rem+0.55vw,1.72rem)]',
		'[&_h3]:font-semibold',
		'[&_h3]:leading-[1.16]',
		'[&_h3]:tracking-[-0.02em]',
		'[&_h4]:mt-[2.3em]',
		'[&_h4]:scroll-mt-18',
		'[&_h4]:text-balance',
		'[&_h4]:text-[1.15rem]',
		'[&_h4]:font-semibold',
		'[&_h4]:leading-[1.16]',
		'[&_h4]:tracking-[-0.02em]',
		'max-[48rem]:[&_h2]:mt-[2em]',
		'max-[48rem]:[&_h3]:mt-[2em]',
		'max-[48rem]:[&_h4]:mt-[2em]',
		'[&_a]:text-primary',
		'[&_a]:underline',
		'[&_a]:decoration-[1.5px]',
		'[&_a]:underline-offset-[0.14em]',
		'[&_a:hover]:text-foreground',
		'[&_strong]:font-bold',
		'[&_strong]:text-foreground',
		'[&_ul]:pl-[1.3rem]',
		'[&_ol]:pl-[1.3rem]',
		'[&_li+li]:mt-[0.55rem]',
		'[&_blockquote]:rounded-r-2xl',
		'[&_blockquote]:border-l-[3px]',
		'[&_blockquote]:border-primary',
		'[&_blockquote]:bg-muted',
		'[&_blockquote]:px-[1.2rem]',
		'[&_blockquote]:py-[1.1rem]',
		'[&_blockquote]:text-[1.02em]',
		'[&_code]:rounded-[0.45rem]',
		'[&_code]:bg-muted',
		'[&_code]:px-[0.45rem]',
		'[&_code]:py-[0.15rem]',
		'[&_code]:text-[0.88em]',
		'[&_code]:text-foreground',
		'[&_pre]:overflow-x-auto',
		'[&_pre]:rounded-[0.9rem]',
		'[&_pre]:border',
		'[&_pre]:border-border',
		'[&_pre]:bg-secondary',
		'[&_pre]:px-[1.1rem]',
		'[&_pre]:py-4',
		'[&_pre]:text-secondary-foreground',
		'[&_pre_code]:rounded-none',
		'[&_pre_code]:bg-transparent',
		'[&_pre_code]:p-0',
		'[&_pre_code]:text-[0.92rem]',
		'[&_pre_code]:leading-[1.7]',
		'[&_pre_code]:text-inherit',
		'[&_hr]:border-0',
		'[&_hr]:border-t',
		'[&_hr]:border-border',
		'[&_table]:w-full',
		'[&_table]:overflow-hidden',
		'[&_table]:rounded-2xl',
		'[&_table]:border',
		'[&_table]:border-separate',
		'[&_table]:border-spacing-0',
		'[&_table]:border-border',
		'[&_table]:text-[0.95rem]',
		'[&_th]:border-b',
		'[&_th]:border-border',
		'[&_th]:bg-muted',
		'[&_th]:px-4',
		'[&_th]:py-[0.85rem]',
		'[&_th]:text-left',
		'[&_th]:font-semibold',
		'[&_td]:border-b',
		'[&_td]:border-border',
		'[&_td]:px-4',
		'[&_td]:py-[0.85rem]',
		'[&_td]:text-left',
		'[&_tr:last-child_td]:border-b-0',
		'[&_.blog-heading-link]:text-inherit',
		'[&_.blog-heading-link]:no-underline',
		'[&_.blog-heading-link]:after:ml-[0.42rem]',
		'[&_.blog-heading-link]:after:text-[0.72em]',
		'[&_.blog-heading-link]:after:font-semibold',
		"[&_.blog-heading-link]:after:content-['#']",
		'[&_.blog-heading-link]:after:text-primary',
		'[&_.blog-heading-link]:after:opacity-0',
		'[&_.blog-heading-link]:after:transition-opacity',
		'[&_.blog-heading-link:hover]:text-inherit',
		'[&_.blog-heading-link:hover]:after:opacity-[0.82]',
		'[&_.blog-figure]:my-9',
		'[&_.blog-figure_img]:block',
		'[&_.blog-figure_img]:w-full',
		'[&_.blog-figure_img]:rounded-2xl',
		'[&_.blog-figure_img]:border',
		'[&_.blog-figure_img]:border-border',
		'[&_.blog-figure_figcaption]:mt-3',
		'[&_.blog-figure_figcaption]:text-center',
		'[&_.blog-figure_figcaption]:text-[0.86rem]',
		'[&_.blog-figure_figcaption]:leading-[1.5]',
		'[&_.blog-figure_figcaption]:text-muted-foreground',
		'[&>img]:block',
		'[&>img]:w-full',
		'[&>img]:rounded-2xl',
		'[&>img]:border',
		'[&>img]:border-border',
		'[&_.video-embed]:relative',
		'[&_.video-embed]:my-8',
		'[&_.video-embed]:h-0',
		'[&_.video-embed]:overflow-hidden',
		'[&_.video-embed]:rounded-2xl',
		'[&_.video-embed]:border',
		'[&_.video-embed]:border-border',
		'[&_.video-embed]:bg-muted',
		'[&_.video-embed]:pb-[56.25%]',
		'[&_.video-embed_iframe]:absolute',
		'[&_.video-embed_iframe]:inset-0',
		'[&_.video-embed_iframe]:h-full',
		'[&_.video-embed_iframe]:w-full'
	].join(' ');

	let articleBody: HTMLElement | null = null;
	let activeHeadingId = $state(tableOfContents[0]?.id ?? '');

	function metaItemClass(index: number) {
		return [
			'inline-flex items-center gap-[0.55rem]',
			index === 0
				? ''
				: "before:size-1.5 before:rounded-full before:bg-primary before:opacity-65 before:content-['']"
		].join(' ');
	}

	function tocLinkClass(level: number, isActive: boolean) {
		return [
			'block border-l-2 py-[0.16rem] text-[0.94rem] leading-[1.45] no-underline transition-colors',
			level === 3 ? 'pl-[1.35rem]' : '-ml-3 pl-3',
			isActive
				? 'border-primary font-semibold text-foreground'
				: 'border-transparent text-muted-foreground hover:text-foreground'
		].join(' ');
	}

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

<article class={articleClass}>
	<header>
		<div class={heroInnerClass}>
			<div>
				<div
					class="flex flex-wrap gap-x-[0.95rem] gap-y-[0.55rem] text-[0.8rem] font-medium tracking-[0.08em] text-muted-foreground uppercase"
				>
					{#each metaItems as item, index (item.key)}
						{#if item.datetime}
							<time class={metaItemClass(index)} datetime={item.datetime}>{item.label}</time>
						{:else}
							<span class={metaItemClass(index)}>{item.label}</span>
						{/if}
					{/each}
				</div>

				<h1
					class="mt-2 max-w-[18ch] text-[clamp(2.25rem,4.8vw,3.9rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
				>
					{post.title}
				</h1>

				{#if post.summary}
					<p
						class="mt-4 max-w-[44rem] text-[clamp(1.03rem,0.96rem+0.32vw,1.16rem)] leading-[1.72] text-pretty text-muted-foreground"
					>
						{post.summary}
					</p>
				{/if}

				{#if post.tags && post.tags.length > 0}
					<ul class="mt-4 flex flex-wrap gap-2" aria-label="Topics">
						{#each post.tags as tag}
							<li
								class="rounded-full border border-border bg-muted px-[0.65rem] py-[0.34rem] text-[0.8rem] font-medium text-muted-foreground"
							>
								{tag}
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			{#if post.featuredImageUrl}
				<figure class="mt-1 overflow-hidden rounded-2xl border border-border bg-muted">
					<img
						class="block h-full min-h-64 w-full object-cover"
						src={post.featuredImageUrl}
						alt={post.featuredImageAlt ?? post.title ?? ''}
					/>
				</figure>
			{/if}
		</div>
	</header>

	<div class={layoutClass}>
		<div class="min-w-0">
			{#if tableOfContents.length > 0}
				<nav
					class={`${tocCardClass} mb-6 min-[72rem]:hidden`}
					aria-labelledby="blog-toc-mobile-title"
				>
					<p id="blog-toc-mobile-title" class={tocTitleClass}>On this page</p>
					<ol class={tocListClass}>
						{#each tableOfContents as item}
							<li>
								<a
									href={`#${item.id}`}
									class={tocLinkClass(item.level, activeHeadingId === item.id)}
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

			<div class={articleContentClass} bind:this={articleBody}>
				{#if htmlContent}
					{@html htmlContent}
				{:else}
					<p class="text-base text-muted-foreground">No content available yet.</p>
				{/if}
			</div>
		</div>

		{#if tableOfContents.length > 0}
			<aside class="hidden min-[72rem]:sticky min-[72rem]:top-20 min-[72rem]:block">
				<nav class={tocCardClass} aria-labelledby="blog-toc-desktop-title">
					<p id="blog-toc-desktop-title" class={tocTitleClass}>On this page</p>
					<ol class={tocListClass}>
						{#each tableOfContents as item}
							<li>
								<a
									href={`#${item.id}`}
									class={tocLinkClass(item.level, activeHeadingId === item.id)}
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
