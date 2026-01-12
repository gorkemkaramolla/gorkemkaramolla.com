<script lang="ts">
	// children'ı buradan almamız gerekiyor
	let { className = '', disabled = false, children, ...rest } = $props();
</script>

<button
	type="button"
	class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 {className}"
	{disabled}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>
