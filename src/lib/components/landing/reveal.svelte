<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { inView } from 'motion';
	import { cn } from '$lib/utils';

	interface Props {
		children: Snippet;
		className?: string;
		/** Stagger child sections by passing an increasing delay (ms). */
		delay?: number;
	}

	let { children, className = '', delay = 0 }: Props = $props();

	let el: HTMLElement;
	let visible = $state(false);

	onMount(() => {
		// Respect reduced-motion: show immediately, no transition.
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			visible = true;
			return;
		}
		// inView fires once the element scrolls ~18% into the viewport.
		const stop = inView(
			el,
			() => {
				visible = true;
			},
			{ amount: 0.18 }
		);
		return () => stop();
	});
</script>

<div
	bind:this={el}
	style:transition-delay={`${delay}ms`}
	class={cn(
		'transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none',
		visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
		className
	)}
>
	{@render children()}
</div>
