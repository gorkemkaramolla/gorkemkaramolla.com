<script lang="ts">
	// children'ı buradan almamız gerekiyor
	let { className = '', children, ...rest } = $props();
</script>

<span
	class="cursor-pointer rounded-2xl border-2 border-blue-400 bg-blue-200 px-2 py-1 active:ring-2 active:ring-blue-500 {className}"
	{...rest}
>
	{#if children}
		#{@render children()}
	{/if}
</span>
