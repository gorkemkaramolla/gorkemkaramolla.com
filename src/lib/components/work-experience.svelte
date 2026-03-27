<script lang="ts">
	import Badge from '$lib/components/badge.svelte';

	type WorkExperience = {
		name: string;
		title: string;
		skills: string[];
		description: string;
		dateStart: string;
		dateEnd: string;
		imageSrc: string;
	};

	let { workExperience }: { workExperience: WorkExperience } = $props();
</script>

<div class="flex flex-col gap-6 rounded-2xl bg-white p-6 md:flex-row md:items-start">
	<div class="flex w-[120px] shrink-0 justify-center">
		<img
			class="max-h-[80px] w-full object-contain"
			src={workExperience.imageSrc}
			alt={`${workExperience.name} logo`}
		/>
	</div>

	<div class="flex-1 space-y-3">
		<div class="space-y-1">
			<h2 class="mt-[-4px] text-2xl font-bold tracking-tight">{workExperience.name}</h2>
			<p class="text-sm text-gray-500">
				{workExperience.dateStart} - {workExperience.dateEnd}
			</p>
		</div>

		<p class="text-lg font-medium text-gray-800">{workExperience.title}</p>

		<p class="leading-6 text-gray-600 italic">
			{workExperience.description}
		</p>

		<div class="flex flex-wrap gap-2">
			{#each workExperience.skills as skill (skill)}
				<Badge>{skill}</Badge>
			{/each}
		</div>
	</div>
</div>
