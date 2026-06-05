<script lang="ts">
	/**
	 * Command-line style typewriter: types each phrase, holds, deletes, and
	 * loops to the next. Honours prefers-reduced-motion by showing the first
	 * phrase statically. The blinking block cursor is pure CSS.
	 */
	import { onMount } from 'svelte';

	let {
		phrases = [] as string[],
		typingSpeed = 65,
		deletingSpeed = 32,
		holdMs = 1700,
		startDelay = 350
	}: {
		phrases?: string[];
		typingSpeed?: number;
		deletingSpeed?: number;
		holdMs?: number;
		startDelay?: number;
	} = $props();

	let text = $state(phrases[0] ?? '');
	let reduced = $state(false);

	onMount(() => {
		reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced || phrases.length === 0) return;

		let phraseIndex = 0;
		let charIndex = 0;
		let deleting = false;
		let timer: ReturnType<typeof setTimeout>;
		text = '';

		const tick = () => {
			const current = phrases[phraseIndex];

			if (!deleting) {
				charIndex++;
				text = current.slice(0, charIndex);
				if (charIndex === current.length) {
					deleting = true;
					timer = setTimeout(tick, holdMs);
					return;
				}
				timer = setTimeout(tick, typingSpeed);
			} else {
				charIndex--;
				text = current.slice(0, charIndex);
				if (charIndex === 0) {
					deleting = false;
					phraseIndex = (phraseIndex + 1) % phrases.length;
					timer = setTimeout(tick, typingSpeed * 4);
					return;
				}
				timer = setTimeout(tick, deletingSpeed);
			}
		};

		timer = setTimeout(tick, startDelay);
		return () => clearTimeout(timer);
	});
</script>

<span class="typewriter font-mono" aria-live="polite"
	>{text}<span class="caret" class:caret-steady={reduced} aria-hidden="true"></span></span
>

<style>
	.typewriter {
		white-space: pre;
	}

	.caret {
		display: inline-block;
		width: 0.6em;
		height: 1.1em;
		margin-left: 0.12em;
		translate: 0 0.16em;
		background: var(--color-brand);
		animation: blink 1.05s steps(1) infinite;
	}

	.caret-steady {
		animation: none;
		opacity: 1;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		50.01%,
		100% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.caret {
			animation: none;
		}
	}
</style>
