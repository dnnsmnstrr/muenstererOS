<script lang="ts">
	import { Slider } from '$lib/components/ui/slider';
	import { Progress } from '$lib/components/ui/progress';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let value = $state(40);
</script>

<div class="w-full max-w-sm space-y-5">
	<p>{i18n.t('design.demo.progress')}: {value}%</p>
	<Slider
		type="single"
		bind:value
		min={0}
		max={100}
		step={5}
		aria-label={i18n.t('design.demo.progress')}
	/>
	<Progress {value} aria-label={i18n.t('design.demo.progress')} />
</div>
