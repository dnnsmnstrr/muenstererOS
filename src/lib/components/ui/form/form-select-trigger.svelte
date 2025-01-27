<script lang="ts">
	import * as Select from "$lib/components/ui/select";
	import type { Select as SelectPrimitive } from "bits-ui";
	import { getFormField } from "formsnap";

	type $$Props = SelectPrimitive.TriggerProps & {
		placeholder?: string;
	};
	type $$Events = SelectPrimitive.TriggerEvents;
	const { attrStore, value } = getFormField();
	interface Props {
		placeholder?: string;
		children?: import('svelte').Snippet<[any]>;
		[key: string]: any
	}

	let { placeholder = "", children, ...rest }: Props = $props();
</script>

<Select.Trigger {...rest} {...$attrStore} on:click on:keydown type="button">
	{#if children}{@render children({ value: $value, })}{:else}
		<Select.Value {placeholder} />
	{/if}
</Select.Trigger>
