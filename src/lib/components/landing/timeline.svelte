<script lang="ts">
	import type { TimelineItem } from '$lib/config/landing-content';

	interface Props {
		items: TimelineItem[];
	}

	let { items }: Props = $props();
</script>

<ol class="relative ml-2 border-l border-border/70">
	{#each items as item (item.title + item.subtitle)}
		<li class="group relative pb-8 pl-7 last:pb-0">
			<!-- node -->
			<span
				class="absolute top-1.5 -left-[7px] h-3 w-3 rounded-full border-2 border-background bg-border ring-1 ring-border transition-colors group-hover:bg-brand group-hover:ring-brand/40"
				aria-hidden="true"
			></span>

			<p class="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
				{item.period}
			</p>
			<h4 class="mt-1.5 text-base font-semibold tracking-[-0.02em] text-foreground sm:text-lg">
				{item.title}
				<span class="text-brand/85">· {item.subtitle}</span>
			</h4>
			<p class="mt-1.5 text-sm leading-7 text-muted-foreground">
				{item.summary}
			</p>
		</li>
	{/each}
</ol>
