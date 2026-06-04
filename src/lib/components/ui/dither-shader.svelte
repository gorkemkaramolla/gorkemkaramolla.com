<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { cn } from '$lib/utils';

	type DitheringMode = 'bayer' | 'halftone' | 'noise' | 'crosshatch';
	type ColorMode = 'original' | 'grayscale' | 'duotone' | 'custom';
	type ObjectFitMode = 'cover' | 'contain' | 'fill' | 'none';
	type PointerMode = 'pan' | 'decode' | 'bulge' | 'glitch';
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
		entranceContrastFrom?: number;
		entranceDuration?: number;
		ambientGlitch?: boolean;
		glitchIntensity?: number;
		glitchColorA?: string;
		glitchColorB?: string;
		glitchActivation?: 'always' | 'hover';
		glitchActive?: boolean;
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
		pointerMode = 'decode',
		waveAmplitude = 0,
		waveFrequency = 6,
		waveSpeed = 1,
		removeLightBackground = false,
		lightBackgroundThreshold = 222,
		lightBackgroundChroma = 36,
		entranceContrastFrom = undefined,
		entranceDuration = 0,
		ambientGlitch = false,
		glitchIntensity = 1,
		glitchColorA = '#ff2e7a',
		glitchColorB = '#22e1ff',
		glitchActivation = 'always',
		glitchActive = false
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
	let hoverLevel = 0; // smooth 0..1 ramp driving the 'hover' glitch activation
	// Wall-clock start of the one-time contrast entrance ramp; set once on first draw.
	let entranceStart: number | null = null;
	const settingsKey = $derived(
		`${gridSize}-${ditherMode}-${colorMode}-${invert}-${pixelRatio}-${primaryColor}-${secondaryColor}-${customPalette.join('|')}-${brightness}-${contrast}-${backgroundColor}-${objectFit}-${threshold}-${animated}-${animationSpeed}-${waveAmplitude}-${waveFrequency}-${waveSpeed}-${removeLightBackground}-${lightBackgroundThreshold}-${lightBackgroundChroma}-${ambientGlitch}-${glitchIntensity}-${glitchColorA}-${glitchColorB}-${glitchActivation}`
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

	// Cheap hash noise in [0, 1) — used by the 'decode' / 'glitch' pointer effects.
	function hashNoise(a: number, b: number): number {
		const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
		return v - Math.floor(v);
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
		const parsedGlitchA = parseColor(glitchColorA); // warm fringe (trailing edge)
		const parsedGlitchB = parseColor(glitchColorB); // cool fringe (leading edge)

		// One-time contrast entrance: ramp from `entranceContrastFrom` up to `contrast`
		// over `entranceDuration` ms (ease-out), based on wall-clock time since first draw.
		let activeContrast = contrast;
		if (entranceContrastFrom != null && entranceDuration > 0 && entranceStart !== null) {
			const progress = clamp((performance.now() - entranceStart) / entranceDuration, 0, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			activeContrast = entranceContrastFrom + (contrast - entranceContrastFrom) * eased;
		}

		// Ambient glitch envelope. Driven purely by frameTime so the portrait corrupts
		// itself on a rhythm — calm most of the time, then short, irregular bursts that
		// tear bands sideways, split the colour channels and drop scanlines. No pointer
		// needed; the glitch lives inside the animation itself.
		// In 'hover' mode the whole effect is gated by a smooth pointer-driven ramp, so the
		// portrait stays calm until hovered; 'always' keeps the continuous ambient run.
		const glitchGate = glitchActivation === 'hover' ? hoverLevel : 1;
		const glitchOn = ambientGlitch && glitchIntensity > 0 && glitchGate > 0.001;
		const glitchBandHeight = Math.max(2, gridSize * 6);
		let glitchTick = 0;
		let glitchBurst = 0;
		let glitchRoll = 0; // whole-frame vertical jump during heavy bursts
		let glitchJump = 0; // whole-frame horizontal jump during heavy bursts
		if (glitchOn) {
			glitchTick = Math.floor(frameTime * 9);
			// Three-tier rhythm: mostly calm with faint life, frequent gentle flickers,
			// and a rare heavy hit (~every couple of seconds) that also jolts the frame.
			const roll = hashNoise(glitchTick, 11.3);
			const heavy = roll > 0.94;
			let surge = 0.05;
			if (heavy) surge = 0.7 + 0.3 * hashNoise(glitchTick, 4.7);
			else if (roll > 0.78) surge = 0.25 + 0.25 * hashNoise(glitchTick, 4.7);
			glitchBurst = clamp(surge * glitchIntensity, 0, 1) * glitchGate;
			if (heavy) {
				glitchRoll = (hashNoise(glitchTick, 9.1) - 0.5) * 0.035 * glitchIntensity * glitchGate;
				glitchJump = (hashNoise(glitchTick, 2.3) - 0.5) * 0.03 * glitchIntensity * glitchGate;
			}
		}

		// Luminance of a source pixel with the same contrast/brightness as the main
		// sample — lets the split read the dither decision a few pixels left/right.
		const sampleGlitchLum = (sx: number, sy: number): number => {
			const cx = sx < 0 ? 0 : sx > sourceWidth - 1 ? sourceWidth - 1 : sx;
			const idx = (sy * sourceWidth + cx) * 4;
			const lr = sourceData[idx] || 0;
			const lg = sourceData[idx + 1] || 0;
			const lb = sourceData[idx + 2] || 0;
			return (
				clamp((getLuminance(lr, lg, lb) - 128) * activeContrast + 128 + brightness * 255, 0, 255) /
				255
			);
		};

		for (let y = 0; y < displayHeight; y += effectivePixelSize) {
			for (let x = 0; x < displayWidth; x += effectivePixelSize) {
				const nx = x / displayWidth;
				const ny = y / displayHeight;
				const active = pointerInteractive && pointer.active;
				const pdx = nx - pointer.x;
				const pdy = ny - pointer.y;
				const pdist = Math.hypot(pdx, pdy);

				// Per-mode pointer interaction. Each effect nudges where we sample the
				// source (sampleNx/sampleNy) and/or how the pixel is shaded below.
				let sampleNx = nx;
				let sampleNy = ny;
				let thresholdShift = 0; // pushes the dither threshold near the cursor
				let brightnessMul = 1; // dims / brightens the output (decode torch)
				let forceHighlight = false; // paint the cell as a bright highlight
				let aberration = 0; // chromatic-split tint for the glitch effect (-1 / +1)
				let splitPx = 0; // chromatic RGB-split distance in source px (ambient glitch)
				let fringeMix = 0; // how strongly the split fringe replaces the base colour

				if (active) {
					switch (pointerMode) {
						case 'pan': {
							sampleNx = nx + (pointer.x - 0.5) * 0.04;
							sampleNy = ny + (pointer.y - 0.5) * 0.04;
							break;
						}
						case 'bulge': {
							// Liquid lens: pull samples toward the cursor so the centre magnifies.
							const radius = 0.32;
							if (pdist < radius) {
								const pull = Math.pow(pdist / radius, 1.7);
								sampleNx = pointer.x + pdx * pull;
								sampleNy = pointer.y + pdy * pull;
							}
							break;
						}
						case 'decode': {
							// Torch that "decodes" the face near the cursor and scrambles it away.
							const reveal = clamp((0.26 - pdist) / 0.14, 0, 1);
							const scramble = 1 - reveal;
							brightnessMul = 0.5 + 0.5 * reveal;
							forceHighlight = reveal > 0.93;
							if (scramble > 0) {
								const n1 = hashNoise(x * 1.7 + frameTime * 40, y * 0.9);
								const n2 = hashNoise(x * 0.8, y * 1.3 + frameTime * 33);
								sampleNx = nx + (n1 - 0.5) * 0.7 * scramble;
								sampleNy = ny + (n2 - 0.5) * 0.7 * scramble;
								thresholdShift = (hashNoise(x + frameTime * 60, y * 2.1) - 0.5) * scramble;
							}
							break;
						}
						case 'glitch': {
							// Realistic digital corruption that concentrates around the cursor and
							// fires in irregular bursts (most frames are calm, some tear hard).
							const near = clamp(1 - pdist / 0.5, 0, 1);
							if (near > 0) {
								const tick = Math.floor(frameTime * 7);
								const burst = hashNoise(tick, 4.2); // calm vs. heavy corruption
								const intensity = near * (burst > 0.7 ? 1 : 0.18);

								// Datamosh: horizontal block-rows tear sideways by random amounts.
								const band = Math.floor(y / Math.max(2, gridSize * 5));
								const rowRand = hashNoise(band * 2.7, tick * 1.3);
								if (rowRand > 0.5) {
									const dir = rowRand > 0.75 ? -1 : 1;
									const shift = (rowRand - 0.5) * 0.9 * intensity;
									sampleNx = nx + dir * shift;
									thresholdShift = (rowRand - 0.5) * 0.3;
									aberration = dir; // RGB split follows the tear direction
								}

								// Signal dropout: sparse bright or crushed scanlines.
								const lineRand = hashNoise(y * 4.1, tick);
								if (lineRand > 0.97) forceHighlight = true;
								else if (lineRand < 0.03 * intensity) brightnessMul = 0.1;
							}
							break;
						}
					}
				}

				// Ambient glitch: corrupt this cell on the current burst rhythm with no
				// dependence on the pointer. Hotter bursts tear more bands and split wider.
				if (glitchOn) {
					sampleNx += glitchJump;
					sampleNy += glitchRoll;

					const band = Math.floor(y / glitchBandHeight);
					const bandRand = hashNoise(band * 2.7 + 0.5, glitchTick * 1.3);
					let tear = glitchBurst * 7; // faint constant shimmer, grows with bursts

					if (bandRand > 1 - glitchBurst) {
						// Datamosh: this whole row-band slides sideways.
						const dir = hashNoise(band, glitchTick) > 0.5 ? 1 : -1;
						const amt =
							(0.05 + 0.22 * glitchBurst) * (0.4 + 0.6 * hashNoise(band * 3.1, glitchTick));
						sampleNx += dir * amt;
						thresholdShift += (hashNoise(band * 1.9, glitchTick) - 0.5) * 0.22;
						tear += 4 + glitchBurst * 9;

						// Signal dropout: rare blown-out or crushed scanlines inside the tear.
						const lineRand = hashNoise(y * 4.1, glitchTick);
						if (lineRand > 0.985) forceHighlight = true;
						else if (lineRand < 0.02) brightnessMul = 0;
					}

					splitPx = Math.min(20, Math.round(1 + tear));
					fringeMix = clamp(0.25 + glitchBurst * 0.85, 0, 1);
				}

				let mappedX = clamp(sampleNx, 0, 1) * sourceWidth;
				let mappedY = clamp(sampleNy, 0, 1) * sourceHeight;

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

				r = clamp((r - 128) * activeContrast + 128 + brightness * 255, 0, 255);
				g = clamp((g - 128) * activeContrast + 128 + brightness * 255, 0, 255);
				b = clamp((b - 128) * activeContrast + 128 + brightness * 255, 0, 255);

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
				if (thresholdShift !== 0) {
					ditherThreshold = clamp(ditherThreshold + thresholdShift, 0, 1);
				}
				let outputColor: [number, number, number];

				// Chromatic RGB-split: compare the dither decision a few source pixels to
				// the left and right of this cell. Where they disagree, the cell sits on a
				// horizontal edge inside the split window, so paint it with one of the two
				// fringe colours (cool leads, warm trails) for a clean aberration look.
				let fringeColor: [number, number, number] | null = null;
				if (
					fringeMix > 0 &&
					splitPx >= 1 &&
					(colorMode === 'duotone' || colorMode === 'grayscale')
				) {
					const litCenter = luminance >= ditherThreshold;
					const litLeft = sampleGlitchLum(srcX - splitPx, srcY) >= ditherThreshold;
					const litRight = sampleGlitchLum(srcX + splitPx, srcY) >= ditherThreshold;
					if (litLeft !== litRight) {
						fringeColor = litRight ? parsedGlitchB : parsedGlitchA;
					} else if (litLeft !== litCenter) {
						fringeColor = litCenter ? parsedGlitchB : parsedGlitchA;
					}
				}

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

				if (fringeColor) {
					outputColor = [
						Math.round(outputColor[0] * (1 - fringeMix) + fringeColor[0] * fringeMix),
						Math.round(outputColor[1] * (1 - fringeMix) + fringeColor[1] * fringeMix),
						Math.round(outputColor[2] * (1 - fringeMix) + fringeColor[2] * fringeMix)
					];
				}

				if (forceHighlight) {
					outputColor =
						colorMode === 'duotone'
							? parsedSecondary
							: colorMode === 'grayscale'
								? [255, 255, 255]
								: outputColor;
				}
				if (brightnessMul !== 1) {
					outputColor = [
						Math.round(outputColor[0] * brightnessMul),
						Math.round(outputColor[1] * brightnessMul),
						Math.round(outputColor[2] * brightnessMul)
					];
				}
				if (aberration !== 0) {
					// Fake chromatic aberration: split the torn cell toward red / cyan.
					outputColor =
						aberration > 0
							? [
									clamp(outputColor[0] + 90, 0, 255),
									outputColor[1],
									clamp(outputColor[2] - 50, 0, 255)
								]
							: [
									clamp(outputColor[0] - 50, 0, 255),
									outputColor[1],
									clamp(outputColor[2] + 90, 0, 255)
								];
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

		// Start the one-time contrast entrance on the first successful draw; never reset
		// it (resizes / theme-color redraws must not replay the reveal).
		const entranceActive = entranceContrastFrom != null && entranceDuration > 0;
		if (entranceActive && entranceStart === null) {
			entranceStart = performance.now();
		}

		applyDithering(ctx, displayWidth, displayHeight, 0);
		stopAnimation();

		if (animated || entranceActive) {
			const tick = () => {
				if (animated) time += animationSpeed;
				if (glitchActivation === 'hover') {
					// Ease toward 1 while hovered, back to 0 on leave — smooth glitch in/out.
					hoverLevel += ((glitchActive ? 1 : 0) - hoverLevel) * 0.12;
				}
				applyDithering(ctx, displayWidth, displayHeight, time);
				const entranceDone =
					!entranceActive ||
					(entranceStart !== null && performance.now() - entranceStart >= entranceDuration);
				if (animated || !entranceDone) {
					animationFrame = requestAnimationFrame(tick);
				}
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
