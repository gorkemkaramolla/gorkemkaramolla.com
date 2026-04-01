<script lang="ts">
	import DitherShader from '$lib/components/ui/dither-shader.svelte';
	import { cn } from '$lib/utils';

	interface Props {
		post: {
			title: string;
			slug: string;
			summary: string | null;
			tags: string[];
			publishedAt: string | null;
			featuredImageUrl: string | null;
			isFeatured: boolean;
		};
		index: number;
		className?: string;
	}

	let { post, index, className = '' }: Props = $props();

	const KB_DIRECTIONS = ['kenburns-nw', 'kenburns-ne', 'kenburns-sw', 'kenburns-se'] as const;
	const kbClass = KB_DIRECTIONS[index % KB_DIRECTIONS.length];

	const imageSrc = post.featuredImageUrl || '/assets/halth-and-catch-fire.webp';

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	const formattedDate = post.publishedAt ? dateFormatter.format(new Date(post.publishedAt)) : null;
</script>

<a
	href={`/blog/${post.slug}`}
	class={cn(
		'group relative flex flex-col overflow-hidden rounded-[1.6rem] border border-border/70 bg-background/45 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-orange-500/28 hover:bg-background/60',
		className
	)}
>
	<!-- Dithered image with Ken Burns -->
	<div class="relative aspect-video w-full overflow-hidden">
		<div
			class={cn(
				'h-full w-full transition-transform duration-700 group-hover:scale-[1.04]',
				kbClass
			)}
		>
			<DitherShader
				src={imageSrc}
				pointerInteractive={true}
				pointerMode="pan"
				gridSize={1}
				colorMode="duotone"
				primaryColor="#161a1e"
				secondaryColor="#d2d7dd"
				contrast={1.12}
				brightness={-0.03}
				threshold={0.5}
				className="rounded-none"
			/>
		</div>
		<!-- Vignette -->
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.45)_100%)]"
		></div>
		<!-- Orange accent line at bottom of image -->
		<div
			aria-hidden="true"
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-orange-500/60 to-transparent"
		></div>
	</div>

	<!-- Content -->
	<div class="flex flex-1 flex-col gap-4 p-6">
		<p class="text-[0.68rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
			{post.isFeatured ? 'Featured note' : `Note 0${index + 1}`}
		</p>

		<h3
			class="max-w-[19ch] text-2xl font-semibold tracking-[-0.05em] text-foreground transition-colors group-hover:text-orange-500"
		>
			{post.title}
		</h3>

		{#if post.summary}
			<p class="line-clamp-3 text-sm leading-7 text-muted-foreground">
				{post.summary}
			</p>
		{/if}

		<div class="mt-auto flex items-center justify-between gap-3 pt-2 text-sm">
			{#if formattedDate}
				<span class="text-muted-foreground">{formattedDate}</span>
			{/if}
			<span class="inline-flex items-center gap-2 font-medium text-foreground">
				Read note
				<svg
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
				>
					<path d="M5 12h14"></path>
					<path d="m13 5 7 7-7 7"></path>
				</svg>
			</span>
		</div>
	</div>
</a>
