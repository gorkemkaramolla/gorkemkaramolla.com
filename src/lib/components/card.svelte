<script lang="ts">
	let { children } = $props();
</script>

<div class="rounded-2xl border border-border bg-muted p-5">
	{#if children}
		{@render children()}
	{/if}
</div>
