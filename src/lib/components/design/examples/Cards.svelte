<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { i18n } from '$lib/i18n/i18n.svelte';
	let saved = $state(false);
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header
		><Card.Title>{i18n.t('design.demo.project')}</Card.Title><Card.Description
			>{i18n.t('design.demo.description')}</Card.Description
		></Card.Header
	>
	<Card.Content
		><Badge variant="secondary">{i18n.t(saved ? 'design.demo.saved' : 'design.demo.draft')}</Badge
		></Card.Content
	>
	<Card.Footer
		><Button onclick={() => (saved = !saved)}
			>{i18n.t(saved ? 'design.demo.reset' : 'design.demo.save')}</Button
		></Card.Footer
	>
</Card.Root>
