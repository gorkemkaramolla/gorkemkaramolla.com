<script lang="ts">
	interface Action {
		label: string;
		href: string;
	}

	interface Props {
		eyebrow?: string;
		title: string;
		description?: string;
		action?: Action;
		id?: string;
	}

	let { eyebrow = '', title, description = '', action, id }: Props = $props();
</script>

<div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
	<div class="space-y-3">
		{#if eyebrow}
			<p class="flex items-center gap-3 text-base font-semibold tracking-[0.18em] text-brand uppercase sm:text-lg">
				<span aria-hidden="true" class="h-0.5 w-9 rounded-full bg-brand/70"></span>
				{eyebrow}
			</p>
		{/if}
		<h2
			{id}
			class="max-w-[20ch] text-3xl font-semibold tracking-[-0.05em] text-balance text-foreground sm:text-4xl"
		>
			{title}
		</h2>
		{#if description}
			<p class="max-w-2xl text-base leading-7 text-pretty text-muted-foreground">
				{description}
			</p>
		{/if}
	</div>

	{#if action}
		<a
			href={action.href}
			class="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground transition hover:text-brand focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
		>
			{action.label}
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
		</a>
	{/if}
</div>
