<script lang="ts">
	import { cn } from "$lib/utils";

	let { class: className, ...restProps }: svelte.JSX.HTMLAttributes<HTMLDivElement> = $props();
</script>

<div class={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...restProps}>
    {@render restProps.children?.()}
</div>
