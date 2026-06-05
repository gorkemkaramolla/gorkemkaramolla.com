<script lang="ts">
	interface Props {
		post: {
			title: string;
			slug: string;
			summary: string | null;
			tags: string[];
			publishedAt: string | null;
			isFeatured: boolean;
		};
		index: number;
	}

	let { post, index }: Props = $props();

	const ordinal = String(index + 1).padStart(3, '0');

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: '2-digit',
		year: 'numeric'
	});
	const formattedDate = post.publishedAt ? dateFormatter.format(new Date(post.publishedAt)) : null;
	const isoDate = post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : null;
</script>

<a href={`/blog/${post.slug}`} class="row group">
	<!-- Brand accent bar grows in on hover -->
	<span aria-hidden="true" class="accent"></span>

	<!-- Index + date column (terminal-flavoured) -->
	<div class="meta font-mono">
		<span class="text-brand">{ordinal}</span>
		{#if formattedDate}
			<time datetime={isoDate ?? undefined} class="text-muted-foreground/80">{formattedDate}</time>
		{/if}
	</div>

	<!-- Main column -->
	<div class="min-w-0">
		<div class="flex items-center gap-2.5">
			<h3
				class="truncate text-xl font-semibold tracking-[-0.03em] text-foreground transition-colors group-hover:text-brand sm:text-2xl"
			>
				{post.title}
			</h3>
			{#if post.isFeatured}
				<span
					class="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 font-mono text-[0.6rem] font-semibold tracking-[0.18em] text-brand uppercase"
				>
					Featured
				</span>
			{/if}
		</div>

		{#if post.summary}
			<p class="mt-2 max-w-[60ch] text-sm leading-7 text-pretty text-muted-foreground line-clamp-2">
				{post.summary}
			</p>
		{/if}

		{#if post.tags.length > 0}
			<ul class="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[0.7rem] text-muted-foreground/70">
				{#each post.tags.slice(0, 4) as tag (tag)}
					<li class="transition-colors group-hover:text-muted-foreground">#{tag}</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Read arrow -->
	<span class="arrow" aria-hidden="true">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-5 w-5"
		>
			<path d="M5 12h14"></path>
			<path d="m13 5 7 7-7 7"></path>
		</svg>
	</span>
</a>

<style>
	.row {
		position: relative;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: start;
		gap: 1.25rem 1.5rem;
		padding: 1.75rem 1.5rem 1.75rem 1.75rem;
		border-top: 1px solid color-mix(in srgb, var(--color-border) 60%, transparent);
		border-radius: 1rem;
		transition:
			background-color 0.25s ease,
			transform 0.25s ease;
	}

	.row:hover {
		background: color-mix(in srgb, var(--color-brand) 7%, transparent);
	}

	.accent {
		position: absolute;
		top: 50%;
		left: 0;
		height: 0;
		width: 2px;
		translate: 0 -50%;
		border-radius: 999px;
		background: var(--color-brand);
		transition: height 0.28s ease;
	}

	.row:hover .accent {
		height: calc(100% - 2.4rem);
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding-top: 0.3rem;
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	.arrow {
		align-self: center;
		display: inline-flex;
		color: var(--color-muted-foreground);
		opacity: 0.5;
		transition:
			transform 0.25s ease,
			opacity 0.25s ease,
			color 0.25s ease;
	}

	.row:hover .arrow {
		color: var(--color-brand);
		opacity: 1;
		transform: translateX(0.35rem);
	}

	@media (max-width: 640px) {
		.row {
			grid-template-columns: 1fr auto;
			padding: 1.4rem 1rem 1.4rem 1.25rem;
		}

		/* date/index sits above the title on small screens */
		.meta {
			grid-column: 1 / -1;
			flex-direction: row;
			align-items: center;
			gap: 0.6rem;
			padding-top: 0;
		}

		.arrow {
			align-self: start;
			padding-top: 0.2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.row,
		.accent,
		.arrow {
			transition: none;
		}
	}
</style>
