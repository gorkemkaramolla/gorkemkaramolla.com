<script lang="ts">
	import Badge from '$lib/components/badge.svelte';
	import Hr from '$lib/components/hr.svelte';

	const skills = Array.from({ length: 10 }, (_, index) => `Skill ${index + 1}`);
	const sectionTitleClass =
		'text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground';
	const linkClass =
		'text-primary underline decoration-[1.5px] underline-offset-4 transition-colors hover:text-foreground';
	const bodyTextClass = 'text-base leading-8 text-muted-foreground';
	const surfaceClass = 'rounded-2xl border border-border bg-muted p-5';
</script>

<div class="mx-auto w-full max-w-7xl bg-background px-6 py-10 text-foreground sm:px-8 lg:px-12 print:max-w-none print:px-0 print:py-0">
	<div class="grid gap-10 print:gap-6">
		<header
			class="grid gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
		>
			<div class="space-y-8">
				<div class="space-y-3">
					<p class={sectionTitleClass}>Resume</p>
					<div class="space-y-2">
						<h1 class="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">GÖRKEM KARAMOLLA</h1>
						<h2 class="text-xl font-medium text-muted-foreground sm:text-2xl">Software Engineer</h2>
					</div>
				</div>

				<div class="grid gap-3 md:grid-cols-2">
					<div
						class="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
					>
						<span class="mr-2 text-foreground">📱</span>
						+905395455259
					</div>
					<div
						class="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
					>
						<span class="mr-2 text-foreground">🔗</span>
						<a class={linkClass} href="https://www.linkedin.com/in/gorkemkaramolla">
							LinkedIn Profile
						</a>
					</div>
					<div
						class="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
					>
						<span class="mr-2 text-foreground">🔗</span>
						<a class={linkClass} href="https://github.com/gorkemkaramolla">GitHub Profile</a>
					</div>
					<div
						class="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
					>
						<span class="mr-2 text-foreground">📧</span>
						<a class={linkClass} href="mailto:gorkemkaramolla@gmail.com">
							gorkemkaramolla@gmail.com
						</a>
					</div>
					<div
						class="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground md:col-span-2"
					>
						<span class="mr-2 text-foreground">📍</span>
						Şişli, Istanbul
					</div>
				</div>
			</div>

			<div class="justify-self-start lg:justify-self-end">
				<div class="rounded-full border border-border bg-muted p-2">
					<img
						src="/assets/gorkemkaramolla.png"
						alt="Görkem Karamolla"
						class="h-36 w-36 rounded-full object-cover ring-2 ring-ring"
					/>
				</div>
			</div>
		</header>

		<div class="grid gap-10 xl:grid-cols-[minmax(0,1fr)_20rem] print:grid-cols-[minmax(0,1fr)_18rem] print:gap-6">
			<div class="space-y-8">
				<section class="space-y-4">
					<h2 class={sectionTitleClass}>Professional Summary</h2>
					<p class={bodyTextClass}>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime atque animi labore!
						Pariatur sequi quibusdam enim qui, aut ad dolor ducimus, est autem consequatur atque
						laborum deleniti vitae doloremque temporibus.
					</p>
				</section>

				<Hr />

				<section class="space-y-6">
					<h2 class={sectionTitleClass}>References</h2>
					<div class="grid gap-4">
						<div class={surfaceClass}>
							<h3 class="text-xl font-semibold tracking-tight">Nihat Sami Kartum</h3>
							<p class="mt-2 text-sm text-muted-foreground">IT Coordinator, Torunlar GYO</p>
							<p class="mt-3 text-sm text-muted-foreground">+90 532 494 13 72</p>
						</div>
						<div class={surfaceClass}>
							<h3 class="text-xl font-semibold tracking-tight">Fuat Altun</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								IT Senior manager, Istanbul Chamber of Industry
							</p>
							<p class="mt-3 text-sm text-muted-foreground">+90 532 714 65 75</p>
						</div>
						<div class={surfaceClass}>
							<h3 class="text-xl font-semibold tracking-tight">Dr. Sibel Boran</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								Head of Software Engineering, Nişantaşı University
							</p>
							<p class="mt-3 text-sm text-muted-foreground">+90 530 833 99 83</p>
						</div>
						<div class={surfaceClass}>
							<h3 class="text-xl font-semibold tracking-tight">Robert Leskovar</h3>
							<p class="mt-2 text-sm text-muted-foreground">
								Professor, Faculty of Organizational Sciences, Maribor University
							</p>
							<a class={`${linkClass} mt-3 inline-block`} href="mailto:robert.leskovar@um.si">
								robert.leskovar@um.si
							</a>
						</div>
					</div>
				</section>
			</div>

			<aside class="space-y-8">
				<section class="space-y-4">
					<h2 class={sectionTitleClass}>Skills</h2>
					<div class="flex flex-wrap gap-2">
						{#each skills as skill (skill)}
							<Badge>{skill}</Badge>
						{/each}
					</div>
				</section>

				<section class="space-y-4">
					<h2 class={sectionTitleClass}>Education</h2>
					<div class={surfaceClass}>
						<h3 class="text-lg font-semibold">Education 1</h3>
					</div>
				</section>

				<section class="space-y-4">
					<h2 class={sectionTitleClass}>Languages</h2>
					<div class={surfaceClass}>
						<h3 class="text-lg font-semibold">Language 1</h3>
					</div>
				</section>

				<section class="space-y-4">
					<h2 class={sectionTitleClass}>Military Service</h2>
					<div class={surfaceClass}>
						<h3 class="text-lg font-semibold">Military Service 1</h3>
					</div>
				</section>
			</aside>
		</div>
	</div>
</div>
