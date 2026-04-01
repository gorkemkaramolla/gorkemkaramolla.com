<script lang="ts">
	import DitherShader from '$lib/components/ui/dither-shader.svelte';
	import { cn } from '$lib/utils';
	import { getNextSceneIndex, getSceneDurationMs } from './cinematic-comic-card.logic';

	type CaptionPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

	export interface CinematicImage {
		src: string;
		alt?: string;
	}

	export interface CinematicCaption {
		text: string;
		position: CaptionPosition;
		panel?: number;
		maxWidth?: string;
	}

	export interface CinematicScene {
		type: 'single' | 'collage';
		images: CinematicImage[];
		captions?: CinematicCaption[];
		durationMs?: number;
	}

	interface Props {
		scenes: CinematicScene[];
		autoplay?: boolean;
		defaultDurationMs?: number;
		loop?: boolean;
		pauseOnHover?: boolean;
		showControls?: boolean;
		startIndex?: number;
		className?: string;
		panelHeightClass?: string;
		initialRevealDelayMs?: number;
		imageRevealStepMs?: number;
	}

	let {
		scenes,
		autoplay = true,
		defaultDurationMs = 3200,
		loop = true,
		pauseOnHover = true,
		showControls = false,
		startIndex = 0,
		className = '',
		panelHeightClass = 'h-[34rem] md:h-[40rem]',
		initialRevealDelayMs = 500,
		imageRevealStepMs = 1200
	}: Props = $props();

	let currentIndex = $state(Math.max(0, startIndex));
	let isPaused = $state(false);
	let hasFocus = $state(false);
	let frameTimeout: ReturnType<typeof setTimeout> | undefined;
	let sequenceTimeouts: ReturnType<typeof setTimeout>[] = [];
	let visiblePanelCount = $state(0);
	let parallaxX = $state(0);
	let parallaxY = $state(0);
	let targetX = 0;
	let targetY = 0;
	let rafId: number | undefined;
	let rootEl: HTMLDivElement | null = null;

	const sceneCount = $derived(scenes.length);
	const currentScene = $derived(scenes[currentIndex]);

	const KB_DIRECTIONS = ['kenburns-nw', 'kenburns-ne', 'kenburns-sw', 'kenburns-se'] as const;

	function getKenBurnsClass(panelIdx: number): string {
		return KB_DIRECTIONS[(currentIndex * 3 + panelIdx) % KB_DIRECTIONS.length];
	}

	const CAPTION_POS_CLASSES: Record<CaptionPosition, string> = {
		'top-left': 'top-3 left-3',
		'top-right': 'top-3 right-3',
		'bottom-left': 'bottom-3 left-3',
		'bottom-right': 'bottom-3 right-3'
	};

	function getCaptionsForPanel(panelNum: number): CinematicCaption[] {
		return (currentScene?.captions ?? []).filter((c) => (c.panel ?? 1) === panelNum);
	}

	function clearFrameTimeout() {
		if (frameTimeout) {
			clearTimeout(frameTimeout);
			frameTimeout = undefined;
		}
	}

	function clearSequenceTimeouts() {
		for (const timeout of sequenceTimeouts) {
			clearTimeout(timeout);
		}
		sequenceTimeouts = [];
	}

	function getPanelCount(): number {
		if (!currentScene) return 0;
		if (currentScene.type === 'single') return Math.min(1, currentScene.images.length);
		return Math.min(3, currentScene.images.length);
	}

	function startSceneSequence() {
		clearSequenceTimeouts();
		visiblePanelCount = 0;
		const panelCount = getPanelCount();
		if (panelCount === 0) return;

		let elapsed = initialRevealDelayMs;
		for (let panel = 1; panel <= panelCount; panel += 1) {
			const timeout = setTimeout(() => {
				visiblePanelCount = panel;
			}, elapsed);
			sequenceTimeouts.push(timeout);
			elapsed += imageRevealStepMs;
		}
	}

	function goToNextScene() {
		currentIndex = getNextSceneIndex(currentIndex, sceneCount, loop);
	}

	const LERP_SPEED = 0.055;

	function lerpLoop() {
		const dx = targetX - parallaxX;
		const dy = targetY - parallaxY;
		if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
			parallaxX += dx * LERP_SPEED;
			parallaxY += dy * LERP_SPEED;
			rafId = requestAnimationFrame(lerpLoop);
		} else {
			parallaxX = targetX;
			parallaxY = targetY;
			rafId = undefined;
		}
	}

	function startLerp() {
		if (rafId === undefined) rafId = requestAnimationFrame(lerpLoop);
	}

	function handleParallaxMove(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
		const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
		targetX = Math.max(-0.5, Math.min(0.5, normalizedX));
		targetY = Math.max(-0.5, Math.min(0.5, normalizedY));
		startLerp();
	}

	function resetParallax() {
		targetX = 0;
		targetY = 0;
		startLerp();
	}

	function panelParallaxStyle(depth = 1): string {
		const x = parallaxX * 12 * depth;
		const y = parallaxY * 9 * depth;
		return `transform:translate3d(${x}px,${y}px,0);will-change:transform;`;
	}

	function scheduleAutoplay() {
		clearFrameTimeout();
		if (!autoplay || isPaused || hasFocus || sceneCount <= 1) return;
		const panelCount = Math.max(1, getPanelCount());
		const sequenceDuration = initialRevealDelayMs + panelCount * imageRevealStepMs + 900;
		const duration = getSceneDurationMs(
			currentScene?.durationMs,
			Math.max(defaultDurationMs, sequenceDuration)
		);
		frameTimeout = setTimeout(() => {
			goToNextScene();
		}, duration);
	}

	$effect(() => {
		return () => {
			if (rafId !== undefined) cancelAnimationFrame(rafId);
		};
	});

	$effect(() => {
		currentIndex = Math.min(Math.max(0, startIndex), Math.max(0, sceneCount - 1));
	});

	$effect(() => {
		currentIndex;
		autoplay;
		isPaused;
		hasFocus;
		defaultDurationMs;
		currentScene?.durationMs;
		currentScene?.type;
		currentScene?.images.length;
		scheduleAutoplay();
		return () => clearFrameTimeout();
	});

	$effect(() => {
		currentIndex;
		currentScene?.captions?.length;
		currentScene?.images.length;
		startSceneSequence();
		return () => clearSequenceTimeouts();
	});
</script>

{#snippet panel(panelIdx: number, src: string, depth: number)}
	<div class="relative h-full w-full overflow-hidden" style={panelParallaxStyle(depth)}>
		<div class={cn('h-full w-full', getKenBurnsClass(panelIdx))}>
			<DitherShader
				{src}
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
		{#each getCaptionsForPanel(panelIdx + 1) as caption}
			<div
				class={cn(
					'pointer-events-none absolute z-10 border border-[#2a2520] bg-[#e8e4dc] px-4 py-2.5 text-[0.85rem] font-bold uppercase leading-snug tracking-wide text-[#1a1714] shadow-[2px_3px_0_rgba(0,0,0,0.4)]',
					CAPTION_POS_CLASSES[caption.position]
				)}
				style={caption.maxWidth ? `max-width:${caption.maxWidth}` : ''}
			>
				{caption.text}
			</div>
		{/each}
	</div>
{/snippet}

<div
	bind:this={rootEl}
	class={cn(
		'relative w-full overflow-hidden rounded-xl border border-white/10 bg-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)]',
		className
	)}
	role="region"
	aria-roledescription="comic cinematic slideshow"
	onfocusin={() => (hasFocus = true)}
	onfocusout={() => (hasFocus = false)}
	onmouseenter={() => (isPaused = pauseOnHover)}
	onmouseleave={() => (isPaused = false)}
>
	<div
		class={cn('relative w-full overflow-hidden bg-black', panelHeightClass)}
		role="img"
		aria-label="Cinematic scene"
		onmousemove={handleParallaxMove}
		onmouseleave={resetParallax}
	>
		{#if currentScene?.type === 'collage'}
			{#if currentScene.images.length >= 3}
				<div class="grid h-full w-full grid-cols-2 grid-rows-[1.2fr_1fr] gap-2 bg-black p-2">
					<div
						class={cn(
							'col-span-2 overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 1 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(0, currentScene.images[0]?.src ?? '', 0.8)}
					</div>
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 2 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(1, currentScene.images[1]?.src ?? '', 1)}
					</div>
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 3 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(2, currentScene.images[2]?.src ?? '', 1.15)}
					</div>
				</div>
			{:else if currentScene.images.length === 2}
				<div class="grid h-full w-full grid-cols-2 gap-2 bg-black p-2">
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 1 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(0, currentScene.images[0]?.src ?? '', 0.95)}
					</div>
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 2 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(1, currentScene.images[1]?.src ?? '', 1.1)}
					</div>
				</div>
			{:else}
				<div class="h-full w-full bg-black p-2">
					<div
						class={cn(
							'h-full w-full overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 1 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(0, currentScene.images[0]?.src ?? '', 1)}
					</div>
				</div>
			{/if}
		{:else}
			<div class="h-full w-full bg-black p-2">
				<div
					class={cn(
						'h-full w-full overflow-hidden transition-all duration-1000 ease-out',
						visiblePanelCount >= 1 ? 'scale-100 opacity-100 blur-0' : 'scale-105 opacity-0 blur-sm'
					)}
				>
					{@render panel(0, currentScene?.images?.[0]?.src ?? '', 1)}
				</div>
			</div>
		{/if}

		<!-- Vignette -->
		<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]"></div>

		<!-- Rain -->
		<div class="rain-overlay"></div>

		<!-- Grain -->
		<div class="grain-overlay"></div>
	</div>

	{#if showControls}
		<div class="flex items-center justify-between border-t border-white/10 bg-black/80 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white/50">
			<span>{currentIndex + 1} / {sceneCount}</span>
		</div>
	{/if}
</div>
