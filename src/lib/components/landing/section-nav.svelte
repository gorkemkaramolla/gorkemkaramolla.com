<script lang="ts">
	/**
	 * Bottom-left scroll cue: a thin beam line with an editorial counter (01 / 07)
	 * and the next section's name, which rolls over (odometer-style) as you scroll.
	 * When the footer comes into view the whole cue slides away and hands off to
	 * the footer's own "Back to top" control. Replaces the old top nav.
	 */
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	type Section = { id: string; label: string };

	let { sections = [] as Section[] }: { sections?: Section[] } = $props();

	let index = $state(0);
	let prefersReduced = false;
	let els: HTMLElement[] = [];

	const total = $derived(sections.length);
	const atEnd = $derived(index >= total - 1);
	const nextLabel = $derived(atEnd ? 'Top' : (sections[index + 1]?.label ?? ''));
	const counter = $derived(
		String(index + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0')
	);
	const t = $derived(prefersReduced ? 0 : 320);

	function collect() {
		els = sections
			.map((s) => document.getElementById(s.id))
			.filter((el): el is HTMLElement => el != null);
	}

	function updateState() {
		if (!els.length) collect();
		const line = window.innerHeight * 0.35;
		let idx = 0;
		els.forEach((el, i) => {
			if (el.getBoundingClientRect().top <= line) idx = i;
		});
		// At the very bottom, pin to the last section so the rail reads 07 / 07 ↑ TOP.
		const reachedBottom =
			window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 96;
		index = reachedBottom ? total - 1 : idx;
	}

	function next() {
		if (!els.length) collect();
		const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
		const target = atEnd ? els[0] : els[index + 1];
		target?.scrollIntoView({ behavior, block: 'start' });
	}

	onMount(() => {
		prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		collect();
		updateState();
		const onScroll = () => updateState();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<button
	type="button"
	class="rail print:hidden"
	onclick={next}
	aria-label={atEnd ? 'Back to top' : `Go to ${nextLabel} section`}
>
	<span class="line" class:up={atEnd} aria-hidden="true"><span class="beam"></span></span>

	<span class="text">
		<span class="swap counter font-mono">
			{#key counter}
				<span
					class="swap-item"
					in:fly={{ y: -14, duration: t, easing: cubicOut }}
					out:fly={{ y: 14, duration: t, easing: cubicOut }}>{counter}</span
				>
			{/key}
		</span>
		<span class="swap label">
			{#key nextLabel}
				<span
					class="swap-item"
					in:fly={{ y: -16, duration: t, easing: cubicOut }}
					out:fly={{ y: 16, duration: t, easing: cubicOut }}
				>
					<span class="lead font-mono">{atEnd ? '↑' : '→'}</span>
					{nextLabel}
				</span>
			{/key}
		</span>
	</span>
</button>

<style>
	.rail {
		position: fixed;
		bottom: clamp(1.5rem, 4vh, 2.75rem);
		left: clamp(1.25rem, 4vw, 3rem);
		z-index: 40;
		/* Hidden on mobile — the full-width content leaves no margin for it, so it
		   would overlap the cards. Shown from `md` up where the left gutter is free. */
		display: none;
		align-items: stretch;
		gap: 0.9rem;
		padding: 0.125rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-muted-foreground);
		transition: color 0.25s ease;
	}

	@media (min-width: 768px) {
		.rail {
			display: flex;
		}
	}

	.rail:hover,
	.rail:focus-visible {
		outline: none;
		color: var(--color-foreground);
	}

	.line {
		position: relative;
		width: 2px;
		align-self: stretch;
		min-height: 3.25rem;
		overflow: hidden;
		border-radius: 999px;
		background: color-mix(in srgb, var(--color-foreground) 16%, transparent);
	}

	.line.up {
		transform: scaleY(-1);
	}

	.beam {
		position: absolute;
		inset-inline: 0;
		top: 0;
		height: 55%;
		background: linear-gradient(
			to bottom,
			transparent,
			var(--color-brand) 55%,
			color-mix(in srgb, var(--color-brand) 60%, white) 80%,
			transparent
		);
		animation: drain 1.9s cubic-bezier(0.45, 0, 0.55, 1) infinite;
	}

	.text {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.3rem;
		text-align: left;
	}

	/* Single-cell grid so old/new values overlap and roll past each other. */
	.swap {
		display: inline-grid;
		justify-items: start;
		overflow: hidden;
	}
	.swap-item {
		grid-area: 1 / 1;
	}

	.counter {
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		color: var(--color-brand);
		opacity: 0.85;
		white-space: nowrap;
		padding-block: 0.05rem;
	}

	.label {
		font-size: 0.9rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		white-space: nowrap;
		padding-block: 0.05rem;
	}

	.label .swap-item {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
	}

	.lead {
		color: var(--color-brand);
		font-weight: 400;
	}

	.rail:hover .label,
	.rail:focus-visible .label {
		color: var(--color-brand);
	}

	@keyframes drain {
		0% {
			transform: translateY(-110%);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			transform: translateY(210%);
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beam {
			animation: none;
			transform: none;
			height: 100%;
			opacity: 0.6;
		}
		.rail,
		.label {
			transition: none;
		}
	}
</style>
