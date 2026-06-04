<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props {
		/** Centered titlebar text (ignored when the `titlebar` snippet is provided). */
		title?: string;
		/** Optional id for the title element (e.g. for aria-labelledby). */
		titleId?: string;
		/** Extra classes for the window (sizing, positioning, animation, ...). */
		class?: string;
		/** Extra classes for the body wrapper below the titlebar. */
		bodyClass?: string;
		/** Show the three Yaru window controls (minimize · maximize · close). */
		controls?: boolean;
		onMinimize?: () => void;
		onMaximize?: () => void;
		onClose?: () => void;
		/** Replace the centered title with custom titlebar content. */
		titlebar?: Snippet;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		title = '',
		titleId,
		class: className = '',
		bodyClass = '',
		controls = true,
		onMinimize,
		onMaximize,
		onClose,
		titlebar,
		children,
		...rest
	}: Props = $props();
</script>

<div class={cn('yaru-card flex flex-col overflow-hidden rounded-[12px]', className)} {...rest}>
	<header class="yaru-card__titlebar relative flex h-11 shrink-0 items-center justify-center px-3">
		{#if titlebar}
			{@render titlebar()}
		{:else if title}
			<h2
				id={titleId}
				class="yaru-card__title pointer-events-none max-w-[55%] truncate text-[0.9rem] font-semibold"
			>
				{title}
			</h2>
		{/if}

		{#if controls}
			<div class="yaru-card__controls absolute right-2.5 flex items-center gap-2">
				<button
					type="button"
					onclick={onMinimize}
					class="yaru-winbtn inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:outline-none"
					aria-label="Minimize"
				>
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						class="h-3 w-3"
					>
						<path d="M6 12h12"></path>
					</svg>
				</button>
				<button
					type="button"
					onclick={onMaximize}
					class="yaru-winbtn inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:outline-none"
					aria-label="Maximize"
				>
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="h-3 w-3"
					>
						<rect x="6" y="6" width="12" height="12" rx="1.6"></rect>
					</svg>
				</button>
				<button
					type="button"
					onclick={onClose}
					class="yaru-winbtn yaru-winbtn--close inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:outline-none"
					aria-label="Close"
				>
					<svg
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round"
						class="h-3 w-3"
					>
						<path d="M7 7l10 10"></path>
						<path d="M17 7L7 17"></path>
					</svg>
				</button>
			</div>
		{/if}
	</header>

	<div class={cn('yaru-card__body min-h-0 flex-1', bodyClass)}>
		{@render children?.()}
	</div>
</div>

<style>
	/* ── Ubuntu / Yaru window (dark) ──
	   Exposes --yaru-* custom properties so nested content can match the window. */
	.yaru-card {
		--yaru-titlebar: #303030;
		--yaru-titlebar-border: #1c1c1c;
		--yaru-body: #242424;
		--yaru-body-2: #2e2e2e;
		--yaru-text: #ffffff;
		--yaru-muted: #c0bfbc;
		--yaru-border: #1c1c1c;
		--yaru-control: rgb(255 255 255 / 0.1);
		--yaru-control-hover: rgb(255 255 255 / 0.18);

		border: 1px solid var(--yaru-titlebar-border);
		background: var(--yaru-body);
		color: var(--yaru-text);
		box-shadow:
			0 0 0 1px rgb(0 0 0 / 0.6),
			0 32px 90px rgb(0 0 0 / 0.62);
	}

	.yaru-card__titlebar {
		background: var(--yaru-titlebar);
		border-bottom: 1px solid var(--yaru-titlebar-border);
		color: var(--yaru-text);
	}

	.yaru-card__title {
		color: var(--yaru-text);
		letter-spacing: 0.01em;
	}

	.yaru-card__body {
		background: var(--yaru-body);
	}

	.yaru-winbtn {
		border: none;
		background: var(--yaru-control);
		color: var(--yaru-text);
		transition:
			background-color 150ms ease,
			color 150ms ease,
			transform 120ms ease;
	}

	.yaru-winbtn:hover {
		background: var(--yaru-control-hover);
	}

	.yaru-winbtn:active {
		transform: scale(0.9);
	}

	.yaru-winbtn--close:hover {
		background: var(--color-brand);
		color: #fff;
	}

</style>
