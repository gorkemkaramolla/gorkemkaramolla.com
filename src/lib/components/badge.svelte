<script lang="ts">
	// children'ı buradan almamız gerekiyor
	let { className = '', children, ...rest } = $props();
</script>

<span
	class="inline-flex rounded-full border border-border bg-muted px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground active:ring-2 active:ring-ring {className}"
	{...rest}
>
	{#if children}
		#{@render children()}
	{/if}
</span>
