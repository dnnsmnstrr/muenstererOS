<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils';

	interface Props {
		options: { value: string; label: string; disabled?: boolean }[];
		value: string;
		name: string;
		emptyItem?: string
		placeholder?: string;
		onValueChange: (value: string) => void
		class?: string;
	}
	let { options, value, name, emptyItem, placeholder, onValueChange, class: className }: Props = $props();

	let triggerContent = $derived(options.find((o: { value: string; label: string; disabled?: boolean }) => o.value === value)?.label ?? placeholder);
</script>

<Select.Root type="single" {name} bind:value {onValueChange} loop>
	<Select.Trigger class={cn("", className)}>
		{triggerContent}
	</Select.Trigger>
	<Select.Content >
		<Select.Group>
            {#if emptyItem}
                <Select.Item id="empty" value="" label={emptyItem}>{emptyItem}</Select.Item>
            {/if}
			{#each options as option (option.value)}
				<Select.Item 
                    value={option.value} 
                    label={option.label} 
                    disabled={option.disabled} 
                />
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
