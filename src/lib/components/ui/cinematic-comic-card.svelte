<script lang="ts">
	import DitherShader from '$lib/components/ui/dither-shader.svelte';
	import { cn } from '$lib/utils';
	import { getNextSceneIndex, getSceneDurationMs } from './cinematic-comic-card.logic';

	type CaptionPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

	export interface CinematicImage {
		src: string;
		alt?: string;
	}

	export interface CinematicContentItem {
		label: string;
		meta?: string;
		href?: string;
	}

	interface CinematicPanelBase {
		href?: string;
	}

	export interface CinematicImagePanel extends CinematicPanelBase {
		type: 'image';
		src: string;
		alt?: string;
	}

	export interface CinematicContentPanel extends CinematicPanelBase {
		type: 'content';
		eyebrow?: string;
		title: string;
		description?: string;
		items?: CinematicContentItem[];
		footer?: string;
	}

	export type CinematicPanel = CinematicImagePanel | CinematicContentPanel;

	export interface CinematicCaption {
		text: string;
		position: CaptionPosition;
		panel?: number;
		maxWidth?: string;
	}

	export interface CinematicScene {
		type: 'single' | 'collage';
		panels?: CinematicPanel[];
		images?: CinematicImage[];
		captions?: CinematicCaption[];
		durationMs?: number;
		href?: string;
		ariaLabel?: string;
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
	const currentPanels = $derived(getScenePanels(currentScene));

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

	function getScenePanels(scene: CinematicScene | undefined): CinematicPanel[] {
		if (!scene) {
			return [];
		}

		if (scene.panels?.length) {
			return scene.panels;
		}

		return (scene.images ?? []).map((image) => ({
			type: 'image',
			src: image.src,
			alt: image.alt
		}));
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
		if (currentScene.type === 'single') return Math.min(1, currentPanels.length);
		return Math.min(3, currentPanels.length);
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
		scheduleAutoplay();
		return () => clearFrameTimeout();
	});

	$effect(() => {
		startSceneSequence();
		return () => clearSequenceTimeouts();
	});
</script>

{#snippet panel(panelIdx: number, panel: CinematicPanel, depth: number)}
	<div class="relative h-full w-full overflow-hidden" style={panelParallaxStyle(depth)}>
		{#if panel.type === 'content'}
			<div
				class="relative h-full w-full border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,247,251,0.98))] dark:border-white/10 dark:bg-[#050608]"
			>
				<div
					aria-hidden="true"
					class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_44%),linear-gradient(180deg,rgba(15,23,42,0.03),transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_44%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_32%)]"
				></div>
				<div
					aria-hidden="true"
					class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent"
				></div>
				<div class="relative flex h-full flex-col justify-between gap-6 p-5 md:p-6">
					<div class="space-y-4">
						{#if panel.eyebrow}
							<p
								class="text-[0.68rem] font-semibold tracking-[0.24em] text-orange-500/85 uppercase"
							>
								{panel.eyebrow}
							</p>
						{/if}
						<h3
							class="max-w-[14ch] text-2xl font-semibold tracking-[-0.05em] text-foreground dark:text-white"
						>
							{panel.title}
						</h3>
						{#if panel.description}
							<p class="max-w-[30ch] text-sm leading-6 text-muted-foreground dark:text-white/65">
								{panel.description}
							</p>
						{/if}
					</div>

					<div class="space-y-3">
						{#if panel.items && panel.items.length > 0}
							{#each panel.items as item, itemIndex (item.label)}
								<div
									class="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
								>
									<div class="flex items-start gap-3">
										<span
											class="mt-1 text-[0.66rem] font-semibold tracking-[0.2em] text-muted-foreground/70 uppercase dark:text-white/35"
										>
											0{itemIndex + 1}
										</span>
										<div class="space-y-1">
											<p class="text-sm leading-6 font-medium text-foreground dark:text-white/92">
												{item.label}
											</p>
											{#if item.meta}
												<p
													class="text-[0.68rem] tracking-[0.18em] text-muted-foreground/80 uppercase dark:text-white/45"
												>
													{item.meta}
												</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						{:else}
							<p class="text-sm leading-6 text-muted-foreground dark:text-white/58">
								New field notes are being prepared.
							</p>
						{/if}
					</div>

					{#if panel.footer}
						<p
							class="text-[0.72rem] tracking-[0.18em] text-muted-foreground/80 uppercase dark:text-white/42"
						>
							{panel.footer}
						</p>
					{/if}
				</div>
			</div>
		{:else}
			<div class={cn('h-full w-full', getKenBurnsClass(panelIdx))}>
				<DitherShader
					src={panel.src}
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
		{/if}
		{#each getCaptionsForPanel(panelIdx + 1) as caption (`${panelIdx}-${caption.text}-${caption.position}`)}
			<div
				class={cn(
					'pointer-events-none absolute z-10 border border-[#2a2520] bg-[#e8e4dc] px-4 py-2.5 text-[0.85rem] leading-snug font-bold tracking-wide text-[#1a1714] uppercase shadow-[2px_3px_0_rgba(0,0,0,0.4)]',
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
		'relative w-full overflow-hidden rounded-xl border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,247,251,0.98))] text-foreground shadow-[0_20px_50px_rgba(148,163,184,0.22)] dark:border-white/10 dark:bg-black dark:text-white dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)]',
		className
	)}
	role="region"
	aria-label={currentScene?.ariaLabel ?? 'Cinematic scene'}
	aria-roledescription="comic cinematic slideshow"
	onfocusin={() => (hasFocus = true)}
	onfocusout={() => (hasFocus = false)}
	onmouseenter={() => (isPaused = pauseOnHover)}
	onmouseleave={() => (isPaused = false)}
>
	<div
		class={cn('relative w-full overflow-hidden bg-background/80 dark:bg-black', panelHeightClass)}
		role="group"
		aria-label={currentScene?.ariaLabel ?? 'Cinematic scene canvas'}
		onmousemove={handleParallaxMove}
		onmouseleave={resetParallax}
	>
		{#if currentPanels.length === 0}
			<div
				class="flex h-full items-center justify-center border border-dashed border-border/70 bg-background/75 p-6 text-sm tracking-[0.18em] text-muted-foreground uppercase dark:border-white/10 dark:bg-black/80 dark:text-white/40"
			>
				Scene unavailable
			</div>
		{:else if currentScene?.type === 'collage'}
			{#if currentPanels.length >= 3}
				<div
					class="grid h-full w-full grid-cols-2 grid-rows-[1.2fr_1fr] gap-2 bg-background/75 p-2 dark:bg-black"
				>
					<div
						class={cn(
							'col-span-2 overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 1
								? 'blur-0 scale-100 opacity-100'
								: 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(0, currentPanels[0], 0.8)}
					</div>
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 2
								? 'blur-0 scale-100 opacity-100'
								: 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(1, currentPanels[1], 1)}
					</div>
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 3
								? 'blur-0 scale-100 opacity-100'
								: 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(2, currentPanels[2], 1.15)}
					</div>
				</div>
			{:else if currentPanels.length === 2}
				<div class="grid h-full w-full grid-cols-2 gap-2 bg-background/75 p-2 dark:bg-black">
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 1
								? 'blur-0 scale-100 opacity-100'
								: 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(0, currentPanels[0], 0.95)}
					</div>
					<div
						class={cn(
							'overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 2
								? 'blur-0 scale-100 opacity-100'
								: 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(1, currentPanels[1], 1.1)}
					</div>
				</div>
			{:else}
				<div class="h-full w-full bg-background/75 p-2 dark:bg-black">
					<div
						class={cn(
							'h-full w-full overflow-hidden transition-all duration-1000 ease-out',
							visiblePanelCount >= 1
								? 'blur-0 scale-100 opacity-100'
								: 'scale-105 opacity-0 blur-sm'
						)}
					>
						{@render panel(0, currentPanels[0], 1)}
					</div>
				</div>
			{/if}
		{:else}
			<div class="h-full w-full bg-background/75 p-2 dark:bg-black">
				<div
					class={cn(
						'h-full w-full overflow-hidden transition-all duration-1000 ease-out',
						visiblePanelCount >= 1 ? 'blur-0 scale-100 opacity-100' : 'scale-105 opacity-0 blur-sm'
					)}
				>
					{@render panel(0, currentPanels[0], 1)}
				</div>
			</div>
		{/if}

		<!-- Vignette -->
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(15,23,42,0.12)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]"
		></div>

		<!-- Rain -->
		<div class="rain-overlay"></div>

		<!-- Grain -->
		<div class="grain-overlay"></div>
	</div>

	{#if showControls}
		<div
			class="flex items-center justify-between border-t border-border/70 bg-background/75 px-3 py-2 text-xs tracking-[0.2em] text-muted-foreground uppercase dark:border-white/10 dark:bg-black/80 dark:text-white/50"
		>
			<span>{currentIndex + 1} / {sceneCount}</span>
		</div>
	{/if}
</div>
