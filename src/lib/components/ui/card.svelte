<script lang="ts">
	let { className = '', children } = $props();
</script>

<div class="rounded-2xl border border-border bg-muted p-5 {className}">
	{#if children}
		{@render children()}
	{/if}
</div>
