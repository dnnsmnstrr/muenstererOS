<script>
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import { NAME_ABBREVIATION, OWNER_NAME, links } from '$lib/config';
	import Typewriter from 'svelte-typewriter';
	import { Button } from './ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';

	const descriptions = $derived([
		{ name: '🤖💻📱⌚🎧', href: links.yat },
		{ name: '💻 ' + i18n.t('profile.descriptions.occupation'), href: links.cv },
		{ name: '🤖 ' + i18n.t('profile.descriptions.builder'), href: links.makerer },
		'📱 ' + i18n.t('profile.descriptions.coder'),
		'🍕 ' + i18n.t('profile.descriptions.pizza'),
		{ name: '💚 ' + i18n.t('profile.descriptions.backer'), href: links.kickstarter },
		{ name: '🎧 ' + i18n.t('profile.descriptions.music'), href: links.spotify },
		{ name: '📺 ' + i18n.t('profile.descriptions.movies'), href: links.imdb },
		{ name: '🧡 ' + i18n.t('profile.descriptions.printer'), href: links.printables },
		{ name: '🌟 ' + i18n.t('profile.descriptions.stargazer'), href: links.github + '?tab=stars' }
	]);
</script>

<Card.Header class="h-card mt-4 flex flex-row flex-wrap items-center justify-start gap-6 md:mt-0">
	<Avatar.Root class="h-24 w-24">
		<Avatar.Image class="u-photo" src="/.well-known/avatar?github" alt="@dnnsmnstrr" />
		<Avatar.Fallback>{NAME_ABBREVIATION}</Avatar.Fallback>
	</Avatar.Root>
	<div class="flex flex-col gap-2">
		<Card.Title class="p-name">{OWNER_NAME}</Card.Title>
		<Card.Description class="h-6">
			{#key i18n.lang}
				<Typewriter mode="loopRandom" interval={100} delay={0} cursor={false}>
					{#each descriptions as description}
						{#if typeof description === 'object'}
							<a href={description.href} target="_blank">{description.name}</a>
						{:else}
							<span>{description}</span>
						{/if}
					{/each}
				</Typewriter>
			{/key}
		</Card.Description>
		<Card.Footer class="hidden p-0 pt-2 md:block">
			<Button href={links.cv  + (i18n.lang === 'de' ? '#de' : '')} size="sm" class="u-url">{i18n.t('profile.find_out_more')}</Button>
		</Card.Footer>
	</div>
</Card.Header>
