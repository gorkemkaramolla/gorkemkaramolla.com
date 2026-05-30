<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { cn } from '$lib/utils';

	type DitheringMode = 'bayer' | 'halftone' | 'noise' | 'crosshatch';
	type ColorMode = 'original' | 'grayscale' | 'duotone' | 'custom';
	type ObjectFitMode = 'cover' | 'contain' | 'fill' | 'none';
	type PointerMode = 'warp' | 'pan';
	interface Props {
		src: string;
		gridSize?: number;
		ditherMode?: DitheringMode;
		colorMode?: ColorMode;
		invert?: boolean;
		pixelRatio?: number;
		primaryColor?: string;
		secondaryColor?: string;
		customPalette?: string[];
		brightness?: number;
		contrast?: number;
		backgroundColor?: string;
		objectFit?: ObjectFitMode;
		threshold?: number;
		animated?: boolean;
		animationSpeed?: number;
		className?: string;
		pointerInteractive?: boolean;
		pointerMode?: PointerMode;
		waveAmplitude?: number;
		waveFrequency?: number;
		waveSpeed?: number;
		removeLightBackground?: boolean;
		lightBackgroundThreshold?: number;
		lightBackgroundChroma?: number;
	}

	let {
		src,
		gridSize = 4,
		ditherMode = 'bayer',
		colorMode = 'original',
		invert = false,
		pixelRatio = 1,
		primaryColor = '#000000',
		secondaryColor = '#ffffff',
		customPalette = ['#000000', '#ffffff'],
		brightness = 0,
		contrast = 1,
		backgroundColor = 'transparent',
		objectFit = 'cover',
		threshold = 0.5,
		animated = false,
		animationSpeed = 0.02,
		className = '',
		pointerInteractive = true,
		pointerMode = 'warp',
		waveAmplitude = 0,
		waveFrequency = 6,
		waveSpeed = 1,
		removeLightBackground = false,
		lightBackgroundThreshold = 222,
		lightBackgroundChroma = 36
	}: Props = $props();

	const BAYER_MATRIX_4X4 = [
		[0, 8, 2, 10],
		[12, 4, 14, 6],
		[3, 11, 1, 9],
		[15, 7, 13, 5]
	];

	const BAYER_MATRIX_8X8 = [
		[0, 32, 8, 40, 2, 34, 10, 42],
		[48, 16, 56, 24, 50, 18, 58, 26],
		[12, 44, 4, 36, 14, 46, 6, 38],
		[60, 28, 52, 20, 62, 30, 54, 22],
		[3, 35, 11, 43, 1, 33, 9, 41],
		[51, 19, 59, 27, 49, 17, 57, 25],
		[15, 47, 7, 39, 13, 45, 5, 37],
		[63, 31, 55, 23, 61, 29, 53, 21]
	];

	let containerEl: HTMLDivElement | null = null;
	let canvasEl: HTMLCanvasElement | null = null;
	let resizeObserver: ResizeObserver | null = null;
	let animationFrame: number | null = null;
	let time = 0;
	let loadedImage: HTMLImageElement | null = null;
	let imageData: ImageData | null = null;
	let dimensions = { width: 0, height: 0 };
	let pointer = { x: 0.5, y: 0.5, active: false };
	const settingsKey = $derived(
		`${gridSize}-${ditherMode}-${colorMode}-${invert}-${pixelRatio}-${primaryColor}-${secondaryColor}-${customPalette.join('|')}-${brightness}-${contrast}-${backgroundColor}-${objectFit}-${threshold}-${animated}-${animationSpeed}-${waveAmplitude}-${waveFrequency}-${waveSpeed}-${removeLightBackground}-${lightBackgroundThreshold}-${lightBackgroundChroma}`
	);

	function parseColor(color: string): [number, number, number] {
		if (color.startsWith('#')) {
			const hex = color.slice(1);
			if (hex.length === 3) {
				return [
					Number.parseInt(hex[0] + hex[0], 16),
					Number.parseInt(hex[1] + hex[1], 16),
					Number.parseInt(hex[2] + hex[2], 16)
				];
			}
			return [
				Number.parseInt(hex.slice(0, 2), 16),
				Number.parseInt(hex.slice(2, 4), 16),
				Number.parseInt(hex.slice(4, 6), 16)
			];
		}
		const match = color.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/i);
		if (match)
			return [Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3])];
		return [0, 0, 0];
	}

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	function getLuminance(r: number, g: number, b: number): number {
		return 0.299 * r + 0.587 * g + 0.114 * b;
	}

	function isConnectedBackdropPixel(data: Uint8ClampedArray, idx: number): boolean {
		if (data[idx + 3] < 10) return false;
		const r = data[idx] || 0;
		const g = data[idx + 1] || 0;
		const b = data[idx + 2] || 0;
		const maxChannel = Math.max(r, g, b);
		const minChannel = Math.min(r, g, b);

		return (
			getLuminance(r, g, b) >= lightBackgroundThreshold &&
			maxChannel - minChannel <= lightBackgroundChroma
		);
	}

	function knockOutConnectedLightBackground(source: ImageData) {
		const { data, width, height } = source;
		const visited = new Uint8Array(width * height);
		const stack: number[] = [];

		const enqueue = (x: number, y: number) => {
			if (x < 0 || x >= width || y < 0 || y >= height) return;
			const point = y * width + x;
			if (visited[point]) return;
			if (!isConnectedBackdropPixel(data, point * 4)) return;
			visited[point] = 1;
			stack.push(point);
		};

		for (let x = 0; x < width; x += 1) {
			enqueue(x, 0);
		}

		for (let y = 0; y < height; y += 1) {
			enqueue(0, y);
			enqueue(width - 1, y);
		}

		while (stack.length > 0) {
			const point = stack.pop();
			if (point === undefined) continue;
			const x = point % width;
			const y = Math.floor(point / width);
			data[point * 4 + 3] = 0;

			enqueue(x + 1, y);
			enqueue(x - 1, y);
			enqueue(x, y + 1);
			enqueue(x, y - 1);
		}

		for (let point = 0; point < visited.length; point += 1) {
			if (visited[point]) continue;

			const x = point % width;
			const y = Math.floor(point / width);
			let nearBackdrop = false;

			for (let oy = -1; oy <= 1 && !nearBackdrop; oy += 1) {
				for (let ox = -1; ox <= 1; ox += 1) {
					if (ox === 0 && oy === 0) continue;
					const nx = x + ox;
					const ny = y + oy;
					if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
					if (visited[ny * width + nx]) {
						nearBackdrop = true;
						break;
					}
				}
			}

			if (!nearBackdrop) continue;

			const idx = point * 4;
			const r = data[idx] || 0;
			const g = data[idx + 1] || 0;
			const b = data[idx + 2] || 0;
			const maxChannel = Math.max(r, g, b);
			const minChannel = Math.min(r, g, b);
			const isSoftBackdropEdge =
				getLuminance(r, g, b) >= lightBackgroundThreshold - 36 &&
				maxChannel - minChannel <= lightBackgroundChroma + 24;

			if (isSoftBackdropEdge) {
				data[idx + 3] = Math.min(data[idx + 3] || 255, 96);
			}
		}
	}

	function applyDithering(
		ctx: CanvasRenderingContext2D,
		displayWidth: number,
		displayHeight: number,
		frameTime = 0
	) {
		if (!imageData) return;

		if (backgroundColor !== 'transparent') {
			ctx.fillStyle = backgroundColor;
			ctx.fillRect(0, 0, displayWidth, displayHeight);
		} else {
			ctx.clearRect(0, 0, displayWidth, displayHeight);
		}

		const sourceData = imageData.data;
		const sourceWidth = imageData.width;
		const sourceHeight = imageData.height;

		const effectivePixelSize = Math.max(1, Math.floor(gridSize * pixelRatio));
		const matrixSize = gridSize <= 4 ? 4 : 8;
		const bayerMatrix = gridSize <= 4 ? BAYER_MATRIX_4X4 : BAYER_MATRIX_8X8;
		const matrixScale = matrixSize === 4 ? 16 : 64;
		const parsedPrimary = parseColor(primaryColor);
		const parsedSecondary = parseColor(secondaryColor);
		const parsedPalette = customPalette.map(parseColor);

		for (let y = 0; y < displayHeight; y += effectivePixelSize) {
			for (let x = 0; x < displayWidth; x += effectivePixelSize) {
				const nx = x / displayWidth;
				const ny = y / displayHeight;
				const dist = Math.hypot(nx - pointer.x, ny - pointer.y);
				const influence = pointerInteractive && pointer.active ? Math.max(0, 1 - dist * 2.4) : 0;
				const panX =
					pointerInteractive && pointer.active ? (pointer.x - 0.5) * sourceWidth * 0.03 : 0;
				const panY =
					pointerInteractive && pointer.active ? (pointer.y - 0.5) * sourceHeight * 0.03 : 0;
				const warpX = nx + (pointer.x - 0.5) * 0.06 * influence;
				const warpY = ny + (pointer.y - 0.5) * 0.06 * influence;
				let mappedX =
					pointerMode === 'pan'
						? (x / displayWidth) * sourceWidth + panX
						: clamp(warpX, 0, 1) * sourceWidth;
				let mappedY =
					pointerMode === 'pan'
						? (y / displayHeight) * sourceHeight + panY
						: clamp(warpY, 0, 1) * sourceHeight;

				// Slow wavy displacement: offset the sampled pixel along a travelling sine wave.
				if (waveAmplitude > 0) {
					mappedX += Math.sin(ny * waveFrequency + frameTime * waveSpeed) * waveAmplitude;
					mappedY += Math.cos(nx * waveFrequency + frameTime * waveSpeed * 0.8) * waveAmplitude;
				}

				const srcX = Math.floor(clamp(mappedX, 0, sourceWidth - 1));
				const srcY = Math.floor(clamp(mappedY, 0, sourceHeight - 1));
				const srcIdx = (srcY * sourceWidth + srcX) * 4;

				let r = sourceData[srcIdx] || 0;
				let g = sourceData[srcIdx + 1] || 0;
				let b = sourceData[srcIdx + 2] || 0;
				const a = sourceData[srcIdx + 3] || 0;
				if (a < 10) continue;

				r = clamp((r - 128) * contrast + 128 + brightness * 255, 0, 255);
				g = clamp((g - 128) * contrast + 128 + brightness * 255, 0, 255);
				b = clamp((b - 128) * contrast + 128 + brightness * 255, 0, 255);

				const luminance = getLuminance(r, g, b) / 255;
				const matrixX = Math.floor(x / gridSize) % matrixSize;
				const matrixY = Math.floor(y / gridSize) % matrixSize;

				let ditherThreshold = bayerMatrix[matrixY][matrixX] / matrixScale;
				switch (ditherMode) {
					case 'halftone': {
						const angle = Math.PI / 4;
						const scale = gridSize * 2;
						const rotX = x * Math.cos(angle) + y * Math.sin(angle);
						const rotY = -x * Math.sin(angle) + y * Math.cos(angle);
						ditherThreshold = (Math.sin(rotX / scale) + Math.sin(rotY / scale) + 2) / 4;
						break;
					}
					case 'noise': {
						const noiseVal = Math.sin(x * 12.9898 + y * 78.233 + frameTime * 100) * 43758.5453;
						ditherThreshold = noiseVal - Math.floor(noiseVal);
						break;
					}
					case 'crosshatch': {
						const line1 = (x + y) % (gridSize * 2) < gridSize ? 1 : 0;
						const line2 = (x - y + gridSize * 4) % (gridSize * 2) < gridSize ? 1 : 0;
						ditherThreshold = (line1 + line2) / 2;
						break;
					}
				}

				ditherThreshold = ditherThreshold * (1 - threshold) + threshold * 0.5;
				if (pointerMode === 'warp') {
					ditherThreshold = clamp(ditherThreshold + influence * 0.14, 0, 1);
				}
				let outputColor: [number, number, number];

				switch (colorMode) {
					case 'grayscale': {
						const dark = luminance < ditherThreshold;
						outputColor = dark ? [0, 0, 0] : [255, 255, 255];
						break;
					}
					case 'duotone': {
						const dark = luminance < ditherThreshold;
						outputColor = dark ? parsedPrimary : parsedSecondary;
						break;
					}
					case 'custom': {
						if (parsedPalette.length === 2) {
							const dark = luminance < ditherThreshold;
							outputColor = dark ? parsedPalette[0] : parsedPalette[1];
						} else {
							const adjusted = luminance + (ditherThreshold - 0.5) * 0.5;
							const index = Math.floor(clamp(adjusted, 0, 1) * (parsedPalette.length - 1));
							outputColor = parsedPalette[index];
						}
						break;
					}
					default: {
						const ditherAmount = ditherThreshold - 0.5;
						const adjustedR = clamp(r + ditherAmount * 64, 0, 255);
						const adjustedG = clamp(g + ditherAmount * 64, 0, 255);
						const adjustedB = clamp(b + ditherAmount * 64, 0, 255);
						const levels = 4;
						outputColor = [
							Math.round(adjustedR / (255 / levels)) * (255 / levels),
							Math.round(adjustedG / (255 / levels)) * (255 / levels),
							Math.round(adjustedB / (255 / levels)) * (255 / levels)
						];
					}
				}

				if (invert) {
					outputColor = [255 - outputColor[0], 255 - outputColor[1], 255 - outputColor[2]];
				}

				ctx.fillStyle =
					a >= 250
						? `rgb(${outputColor[0]}, ${outputColor[1]}, ${outputColor[2]})`
						: `rgba(${outputColor[0]}, ${outputColor[1]}, ${outputColor[2]}, ${(a / 255).toFixed(3)})`;
				ctx.fillRect(x, y, effectivePixelSize, effectivePixelSize);
			}
		}
	}

	function stopAnimation() {
		if (animationFrame) {
			cancelAnimationFrame(animationFrame);
			animationFrame = null;
		}
	}

	function handlePointerMove(event: PointerEvent) {
		if (!pointerInteractive) return;
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		pointer = {
			x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
			y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
			active: true
		};
		if (!animated) drawWithCurrentState();
	}

	function handlePointerLeave() {
		if (!pointerInteractive) return;
		pointer = { x: 0.5, y: 0.5, active: false };
		if (!animated) drawWithCurrentState();
	}

	function drawWithCurrentState() {
		if (!canvasEl || !loadedImage || dimensions.width === 0 || dimensions.height === 0) return;

		const dpr = window.devicePixelRatio || 1;
		const displayWidth = dimensions.width;
		const displayHeight = dimensions.height;

		canvasEl.width = Math.floor(displayWidth * dpr);
		canvasEl.height = Math.floor(displayHeight * dpr);

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.resetTransform();
		ctx.scale(dpr, dpr);

		const offscreen = document.createElement('canvas');
		const iw = loadedImage.naturalWidth || displayWidth;
		const ih = loadedImage.naturalHeight || displayHeight;

		let dw = displayWidth;
		let dh = displayHeight;
		let dx = 0;
		let dy = 0;

		if (objectFit === 'cover') {
			const scale = Math.max(displayWidth / iw, displayHeight / ih);
			dw = Math.ceil(iw * scale);
			dh = Math.ceil(ih * scale);
			dx = Math.floor((displayWidth - dw) / 2);
			dy = Math.floor((displayHeight - dh) / 2);
		} else if (objectFit === 'contain') {
			const scale = Math.min(displayWidth / iw, displayHeight / ih);
			dw = Math.ceil(iw * scale);
			dh = Math.ceil(ih * scale);
			dx = Math.floor((displayWidth - dw) / 2);
			dy = Math.floor((displayHeight - dh) / 2);
		} else if (objectFit === 'none') {
			dw = iw;
			dh = ih;
			dx = Math.floor((displayWidth - dw) / 2);
			dy = Math.floor((displayHeight - dh) / 2);
		}

		offscreen.width = displayWidth;
		offscreen.height = displayHeight;
		const offCtx = offscreen.getContext('2d');
		if (!offCtx) return;
		offCtx.drawImage(loadedImage, dx, dy, dw, dh);

		try {
			imageData = offCtx.getImageData(0, 0, displayWidth, displayHeight);
			if (removeLightBackground) {
				knockOutConnectedLightBackground(imageData);
			}
		} catch {
			console.error('Could not get image data. CORS issue?');
			return;
		}

		applyDithering(ctx, displayWidth, displayHeight, 0);
		stopAnimation();

		if (animated) {
			const tick = () => {
				time += animationSpeed;
				applyDithering(ctx, displayWidth, displayHeight, time);
				animationFrame = requestAnimationFrame(tick);
			};
			animationFrame = requestAnimationFrame(tick);
		}
	}

	async function loadImageAndRender() {
		if (!src) return;
		const img = new Image();
		img.crossOrigin = 'anonymous';

		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error(`Failed to load image for DitherShader: ${src}`));
			img.src = src;
		}).catch((error) => {
			console.error(error);
		});

		if (!img.complete) return;
		loadedImage = img;
		drawWithCurrentState();
	}

	onMount(() => {
		if (!containerEl) return;
		resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width, height } = entry.contentRect;
				if (width > 0 && height > 0) {
					dimensions = { width, height };
					drawWithCurrentState();
				}
			}
		});
		resizeObserver.observe(containerEl);
		loadImageAndRender();
	});

	onDestroy(() => {
		stopAnimation();
		resizeObserver?.disconnect();
	});

	$effect(() => {
		src;
		loadImageAndRender();
	});

	$effect(() => {
		settingsKey;
		drawWithCurrentState();
	});
</script>

<div
	bind:this={containerEl}
	class={cn('relative h-full w-full overflow-hidden rounded-2xl', className)}
>
	<canvas
		bind:this={canvasEl}
		class="absolute inset-0 h-full w-full"
		style="image-rendering: pixelated;"
		aria-label="Dithered image"
		onpointermove={handlePointerMove}
		onpointerleave={handlePointerLeave}
	></canvas>
</div>
