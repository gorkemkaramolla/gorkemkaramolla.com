<script lang="ts">
	import Badge from '$lib/components/badge.svelte';
	import Hr from '$lib/components/hr.svelte';
</script>

<div class="mx-auto prose w-full max-w-none">
	<div class="header flex w-full justify-between">
		<div>
			<h1 class="">GÖRKEM KARAMOLLA</h1>
			<h2 class="">Software Engineer</h2>
		</div>
		<div>
			<img
				src="/assets/gorkemkaramolla.png"
				alt="Görkem Karamolla"
				class="h-36 rounded-full p-1 ring-4 ring-green-600"
			/>
		</div>
	</div>
	<div class="grid grid-cols-2 gap-4">
		<div class="info">📱 +905395455259</div>
		<div class="info">
			🔗 <a href="www.linkedin.com/in/gorkemkaramolla">Linkedin Profile</a>
		</div>
		<div class="info">
			🔗 <a href="https://github.com/gorkemkaramolla">Github Profile</a>
		</div>
		<div class="info">
			📧 <a href="mailto:gorkemkaramolla@gmail.com">gorkemkaramolla@gmail.com</a>
		</div>
		<div class="info">📍 Şişli, Istanbul</div>
	</div>
	<Hr />
	<div class="content grid grid-cols-12 gap-4">
		<div class="left col-span-9">
			<div class="professional-summary">
				<h2>PROFESSIONAL SUMMARY</h2>
				<div>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime atque animi labore!
					Pariatur sequi quibusdam enim qui, aut ad dolor ducimus, est autem consequatur atque
					laborum deleniti vitae doloremque temporibus.
				</div>
			</div>

			<Hr />
			<div class="references">
				<h2>REFERENCES</h2>
				<div class="reference">
					<h3>Nihat Sami Kartum</h3>
					<p>IT Coordinator, Torunlar GYO</p>
					<p>+90 532 494 13 72</p>
				</div>
				<div class="reference">
					<h3>Fuat Altun</h3>
					<p>IT Senior manager, Istanbul Chamber of Industry</p>
					<p>+90 532 714 65 75</p>
				</div>
				<div class="reference">
					<h3>Dr. Sibel Boran</h3>
					<p>Head of Software Engineering,Nişantaşı University</p>
					<p>+90 530 833 99 83</p>
				</div>
				<div class="reference">
					<h3>Robert Leskovar</h3>
					<p>Professor, Faculty of Organizational Sciences, Maribor University</p>
					<a href="mailto:robert.leskovar@um.si">robert.leskovar@um.si</a>
				</div>
			</div>
		</div>
		<div class="right col-span-3">
			<div class="skills">
				<div class="skill-list flex flex-wrap gap-2">
					{#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as skill (skill)}
						<Badge>Skill {skill}</Badge>
					{/each}
				</div>
			</div>
			<div class="education">
				<h2>EDUCATION</h2>
				<div class="education-list">
					<div class="education-item">
						<h3>Education 1</h3>
					</div>
				</div>
			</div>
			<div class="languages">
				<h2>LANGUAGES</h2>
				<div class="language-list">
					<div class="language-item">
						<h3>Language 1</h3>
					</div>
				</div>
			</div>
			<div class="military-service">
				<h2>MILITARY SERVICE</h2>
				<div class="military-service-list">
					<div class="military-service-item">
						<h3>Military Service 1</h3>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
