<script lang="ts">
	let { class: className = '', children, ...rest } = $props();
</script>

<button class="cursor-pointer {className}" {...rest}>
	{#if children}
		{@render children()}
	{/if}
</button>
