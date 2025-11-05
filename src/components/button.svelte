<script lang="ts">
	export let className = '';
	export let disabled = false;
</script>

<button
	class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${className}"
	title="Button"
	{disabled}
>
	<slot />
</button>
